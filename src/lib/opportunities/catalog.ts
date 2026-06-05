import opportunitiesData from '@/src/data/opportunities.json';
import type { Opportunity } from '@/src/lib/seekbot/types';

export interface OpportunityFilterOptions {
  categories: string[];
  locations: string[];
  audiences: string[];
  tags: string[];
  budgetMin: number;
  budgetMax: number;
}

export const opportunities = opportunitiesData as Opportunity[];

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function getOpportunityById(id: string): Opportunity | undefined {
  return opportunities.find((opportunity) => opportunity.id === id);
}

export function formatBudgetRange(opportunity: Opportunity): string {
  return `AED ${opportunity.budget_min.toLocaleString()} – AED ${opportunity.budget_max.toLocaleString()}`;
}

export function formatReach(opportunity: Opportunity): string {
  return `${opportunity.estimated_reach.toLocaleString()} people`;
}

export function getOpportunitySearchText(opportunity: Opportunity): string {
  return [
    opportunity.id,
    opportunity.title,
    opportunity.short_summary,
    opportunity.full_description,
    opportunity.location,
    ...(opportunity.category ?? []),
    ...(opportunity.audience ?? []),
    ...(opportunity.tags ?? []),
    ...(opportunity.sponsorship_benefits ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getFilterOptions(catalog: Opportunity[]): OpportunityFilterOptions {
  const budgetMinimums = catalog.map((opportunity) => opportunity.budget_min).filter(Number.isFinite);
  const budgetMaximums = catalog.map((opportunity) => opportunity.budget_max).filter(Number.isFinite);

  return {
    categories: uniqueSorted(catalog.flatMap((opportunity) => opportunity.category ?? [])),
    locations: uniqueSorted(catalog.map((opportunity) => opportunity.location)),
    audiences: uniqueSorted(catalog.flatMap((opportunity) => opportunity.audience ?? [])),
    tags: uniqueSorted(catalog.flatMap((opportunity) => opportunity.tags ?? [])),
    budgetMin: budgetMinimums.length > 0 ? Math.min(...budgetMinimums) : 0,
    budgetMax: budgetMaximums.length > 0 ? Math.max(...budgetMaximums) : 0,
  };
}
