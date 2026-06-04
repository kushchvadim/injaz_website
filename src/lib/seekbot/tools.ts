import opportunitiesData from '../../data/opportunities.json';
import type { CompactOpportunity, Opportunity, SearchOpportunitiesArgs, SearchOpportunitiesResult } from './types';

const opportunities = opportunitiesData as Opportunity[];

export const searchOpportunitiesTool = {
  type: 'function',
  name: 'search_opportunities',
  description:
    'Search the local sponsorship opportunities file and return relevant real opportunity IDs with compact summaries. Use this before recommending specific opportunity cards.',
  strict: true,
  parameters: {
    type: 'object',
    additionalProperties: false,
    properties: {
      query: { type: 'string', description: 'Natural-language sponsorship search query.' },
      audience: { type: 'array', items: { type: 'string' }, description: 'Target audience segments.' },
      location: { type: 'string', description: 'Preferred location, city, emirate, or UAE-wide.' },
      categories: { type: 'array', items: { type: 'string' }, description: 'Preferred opportunity categories.' },
      budgetMin: { type: 'number', description: 'Minimum sponsor budget, or 0 if unknown.' },
      budgetMax: { type: 'number', description: 'Maximum sponsor budget, or 0 if unknown.' },
      limit: { type: 'number', description: 'Maximum number of matches to return. Default 5, maximum 8.' },
    },
    required: ['query', 'audience', 'location', 'categories', 'budgetMin', 'budgetMax', 'limit'],
  },
} as const;

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'of', 'on', 'or', 'our', 'the',
  'to', 'we', 'with', 'want', 'need', 'looking', 'targeting', 'goals', 'goal', 'kind', 'type', 'some', 'any',
]);

function normalize(value: unknown): string {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokens(value: unknown): Set<string> {
  return new Set(
    normalize(value)
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function arrayFromUnknown(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 12) : [];
}

export function normalizeSearchArgs(raw: unknown): SearchOpportunitiesArgs {
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const limit = Number(value.limit);

  return {
    query: typeof value.query === 'string' ? value.query.slice(0, 1000) : '',
    audience: arrayFromUnknown(value.audience),
    location: typeof value.location === 'string' ? value.location.slice(0, 200) : '',
    categories: arrayFromUnknown(value.categories),
    budgetMin: Number.isFinite(Number(value.budgetMin)) ? Math.max(0, Number(value.budgetMin)) : 0,
    budgetMax: Number.isFinite(Number(value.budgetMax)) ? Math.max(0, Number(value.budgetMax)) : 0,
    limit: Number.isFinite(limit) ? Math.min(8, Math.max(1, Math.round(limit))) : 5,
  };
}

function compactOpportunity(opportunity: Opportunity): CompactOpportunity {
  return {
    id: opportunity.id,
    title: opportunity.title,
    short_summary: opportunity.short_summary,
    location: opportunity.location,
    category: opportunity.category,
    audience: opportunity.audience,
    estimated_reach: opportunity.estimated_reach,
    budget_min: opportunity.budget_min,
    budget_max: opportunity.budget_max,
    sponsorship_benefits: opportunity.sponsorship_benefits,
    tags: opportunity.tags,
  };
}

function overlapScore(needles: string[], haystack: string): number {
  const haystackTokens = tokens(haystack);
  return needles.reduce((score, token) => score + (haystackTokens.has(token) ? 1 : 0), 0);
}

function budgetOverlaps(args: SearchOpportunitiesArgs, opportunity: Opportunity): boolean {
  if (args.budgetMin <= 0 && args.budgetMax <= 0) return false;

  const requestedMin = args.budgetMin > 0 ? args.budgetMin : 0;
  const requestedMax = args.budgetMax > 0 ? args.budgetMax : Number.MAX_SAFE_INTEGER;

  return requestedMin <= opportunity.budget_max && requestedMax >= opportunity.budget_min;
}

function scoreOpportunity(args: SearchOpportunitiesArgs, opportunity: Opportunity): number {
  const queryTokens = Array.from(tokens(args.query));
  const opportunitySearchText = [
    opportunity.title,
    opportunity.short_summary,
    opportunity.full_description,
    opportunity.location,
    ...opportunity.category,
    ...opportunity.audience,
    ...opportunity.tags,
    ...opportunity.sponsorship_benefits,
  ].join(' ');

  let score = overlapScore(queryTokens, opportunitySearchText) * 6;

  const normalizedLocation = normalize(args.location);
  if (normalizedLocation) {
    const opportunityLocation = normalize(opportunity.location);
    if (opportunityLocation.includes(normalizedLocation) || normalizedLocation.includes(opportunityLocation)) {
      score += 24;
    } else if (normalizedLocation.includes('uae') && opportunityLocation.includes('uae')) {
      score += 8;
    }
  }

  const categoryTokens = args.categories.flatMap((category) => Array.from(tokens(category)));
  score += overlapScore(categoryTokens, opportunity.category.join(' ')) * 10;

  const audienceTokens = args.audience.flatMap((audience) => Array.from(tokens(audience)));
  score += overlapScore(audienceTokens, opportunity.audience.join(' ')) * 9;

  if (budgetOverlaps(args, opportunity)) {
    score += 12;
  }

  if (score === 0 && queryTokens.length === 0 && !normalizedLocation && categoryTokens.length === 0 && audienceTokens.length === 0) {
    score = Math.min(10, opportunity.estimated_reach / 1000);
  }

  return score;
}

export function searchOpportunities(rawArgs: unknown): SearchOpportunitiesResult {
  const args = normalizeSearchArgs(rawArgs);
  const scored = opportunities
    .map((opportunity) => ({ opportunity, score: scoreOpportunity(args, opportunity) }))
    .sort((a, b) => b.score - a.score || b.opportunity.estimated_reach - a.opportunity.estimated_reach);

  const positiveMatches = scored.filter((item) => item.score > 0);
  const selected = (positiveMatches.length > 0 ? positiveMatches : scored).slice(0, args.limit);

  return {
    status: 'success',
    matched_count: positiveMatches.length,
    opportunities: selected.map((item) => compactOpportunity(item.opportunity)),
  };
}

export function getOpportunityById(id: string): Opportunity | undefined {
  return opportunities.find((opportunity) => opportunity.id === id);
}

export function getOpportunityIds(): Set<string> {
  return new Set(opportunities.map((opportunity) => opportunity.id));
}
