import type { Opportunity } from '@/src/lib/seekbot/types';
import type { SeekBotSponsorProfile } from '@/src/lib/seekbot/start_search';

function clean(value: string | undefined, fallback = 'Not specified', maxLength = 220): string {
  const trimmed = String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : fallback;
}

function profileSummary(profile?: SeekBotSponsorProfile | null): string {
  if (!profile) return 'No sponsor profile was provided. Infer a practical plan from the selected opportunities.';

  return [
    `Business type: ${clean(profile.businessType, 'Not specified', 160)}`,
    `Target audience: ${clean(profile.audience, 'Not specified', 180)}`,
    `Budget: ${clean(profile.budget, 'Not specified', 120)}`,
    `Preferred location: ${clean(profile.location, 'Not specified', 120)}`,
    `Goals: ${clean(profile.goals, 'Not specified', 240)}`,
  ].join('\n');
}

function opportunitySummary(opportunity: Opportunity): string {
  return [
    `ID: ${opportunity.id}`,
    `Title: ${clean(opportunity.title, 'Untitled opportunity', 120)}`,
    `Location: ${clean(opportunity.location, 'Not specified', 80)}`,
    `Categories: ${opportunity.category.slice(0, 4).join(', ') || 'Not specified'}`,
    `Audience: ${opportunity.audience.slice(0, 4).join(', ') || 'Not specified'}`,
    `Budget range: AED ${opportunity.budget_min.toLocaleString()}–${opportunity.budget_max.toLocaleString()}`,
    `Estimated reach: ${opportunity.estimated_reach.toLocaleString()}`,
    `Benefits: ${opportunity.sponsorship_benefits.slice(0, 4).join('; ') || 'Not specified'}`,
  ].join('\n');
}

export function buildSponsorshipPlanPrompt(profile: SeekBotSponsorProfile | null | undefined, selectedOpportunities: Opportunity[]): string {
  const selectedSummaries = selectedOpportunities.slice(0, 6).map((opportunity, index) => (
    `Selected opportunity ${index + 1}:\n${opportunitySummary(opportunity)}`
  )).join('\n\n');

  const prompt = `Create a practical sponsorship plan using the existing SeekBot chat response format.

Sponsor profile:
${profileSummary(profile)}

Instructions:
- Build a concise but practical sponsorship plan for the selected shortlisted opportunities only.
- Use selected real opportunity IDs only and do not invent opportunities.
- Include recommended budget allocation across the selected opportunities.
- Explain why each opportunity is included.
- Include expected reach and visibility / CSR / youth engagement rationale.
- Include negotiation or activation suggestions for getting the most value.
- Create the sponsorship plan in the reply field.
- Keep the response compatible with the existing strict JSON response shape: reply, cards, suggested_questions, and meta.
- Include cards only for selected shortlisted opportunities if those IDs can be safely referenced; otherwise return cards: [].

Shortlisted opportunities:
${selectedSummaries || 'No selected opportunities were provided.'}`;

  return prompt.slice(0, 2000);
}
