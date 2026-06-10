import type { Opportunity } from '@/src/lib/seekbot/types';
import type { SeekBotSponsorProfile } from '@/src/lib/seekbot/start_search';

function clean(value: string | undefined, fallback = 'Not specified', maxLength = 260): string {
  const trimmed = String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : fallback;
}

function cleanList(values: string[] | undefined, fallback = 'Not specified', maxItems = 5): string {
  const cleanedValues = (values ?? [])
    .map((value) => clean(value, '', 140))
    .filter(Boolean)
    .slice(0, maxItems);

  return cleanedValues.length > 0 ? cleanedValues.join(', ') : fallback;
}

function profileSummary(profile?: SeekBotSponsorProfile | null): string {
  if (!profile) return 'No sponsor profile was provided. Infer a practical plan from the selected opportunities.';

  return [
    `Business type: ${clean(profile.businessType, 'Not specified', 160)}`,
    `Location: ${clean(profile.location, 'Not specified', 120)}`,
    `Budget: ${clean(profile.budget, 'Not specified', 120)}`,
    `Target audience: ${clean(profile.audience, 'Not specified', 180)}`,
    `Goals: ${clean(profile.goals, 'Not specified', 240)}`,
  ].join('\n');
}

function opportunitySummary(opportunity: Opportunity, index: number): string {
  return [
    `${index + 1}. ${clean(opportunity.title, 'Untitled opportunity', 140)}`,
    `- ID: ${clean(opportunity.id, 'Not specified', 80)}`,
    `- Location: ${clean(opportunity.location, 'Not specified', 100)}`,
    `- Budget: AED ${opportunity.budget_min.toLocaleString()} – AED ${opportunity.budget_max.toLocaleString()}`,
    `- Estimated reach: ${opportunity.estimated_reach.toLocaleString()} people`,
    `- Target audience: ${cleanList(opportunity.audience)}`,
    `- Categories: ${cleanList(opportunity.category)}`,
    `- Description: ${clean(opportunity.short_summary || opportunity.full_description, 'Not specified', 260)}`,
    `- Sponsorship benefits: ${cleanList(opportunity.sponsorship_benefits, 'Not specified', 6)}`,
  ].join('\n');
}

export function buildSponsorshipPlanDisplayMessage(selectedOpportunities: Opportunity[]): string {
  const titles = selectedOpportunities.map((opportunity) => clean(opportunity.title, 'Untitled opportunity', 140));

  if (titles.length === 1) {
    return `Build a sponsorship plan for the following shortlisted opportunity: ${titles[0]}.`;
  }

  return `Build a sponsorship plan for these ${titles.length} shortlisted opportunities:\n\n${titles
    .map((title, index) => `${index + 1}. ${title}`)
    .join('\n')}`;
}

export function buildSponsorshipPlanPrompt(profile: SeekBotSponsorProfile | null | undefined, selectedOpportunities: Opportunity[]): string {
  const selected = selectedOpportunities.slice(0, 6);
  const selectedSummaries = selected.map(opportunitySummary).join('\n\n');
  const requestLine = selected.length === 1
    ? `Build a sponsorship plan for the following shortlisted opportunity: ${clean(selected[0]?.title, 'Untitled opportunity', 140)}.`
    : `Build a sponsorship plan for these ${selected.length} shortlisted opportunities:`;

  const prompt = `${requestLine}

Sponsor profile:
${profileSummary(profile)}

Shortlisted opportunities:
${selectedSummaries || 'No selected opportunities were provided.'}

Please create a practical sponsorship plan comparing the shortlisted opportunities, explaining which is best for the sponsor's goals, suggested package, activation ideas, budget allocation, expected benefits, and next steps.

Instructions:
- Use only the shortlisted opportunities listed above. Do not invent opportunities.
- Reference each selected opportunity by exact title and ID.
- Include recommended budget allocation across the selected opportunities.
- Explain why each opportunity is included and how it supports visibility, CSR, and youth engagement goals.
- Include negotiation or activation suggestions for getting the most value.
- Keep the response compatible with the existing strict JSON response shape: reply, cards, suggested_questions, and meta.
- Include cards only for selected shortlisted opportunities if those IDs can be safely referenced; otherwise return cards: [].`;

  return prompt.slice(0, 4000);
}
