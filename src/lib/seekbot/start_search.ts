export interface SeekBotSponsorProfile {
  audience: string;
  budget: string;
  location: string;
  goals: string;
  businessType: string;
}

function cleanProfileValue(value: string, maxLength: number): string {
  const trimmed = value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : 'Not specified';
}

export function buildSeekBotStartSearchPrompt(profile: SeekBotSponsorProfile): string {
  const prompt = `This is the sponsor profile:

Sponsor profile:
- Business type: ${cleanProfileValue(profile.businessType, 160)}
- Target audience: ${cleanProfileValue(profile.audience, 220)}
- Budget: ${cleanProfileValue(profile.budget, 120)}
- Preferred location: ${cleanProfileValue(profile.location, 120)}
- Sponsorship goals: ${cleanProfileValue(profile.goals, 300)}

Find the 3 best sponsorship opportunities that match these needs. Prioritise business relevance, audience fit, location fit, budget fit, CSR value, visibility, and practical sponsorship value.

Use real opportunities only. Always use the search_opportunities tool before recommending opportunity cards, and recommend only real opportunity IDs returned by that tool.

Return only the top 3 strongest matches. For each match, explain:
- business fit
- audience fit
- CSR and visibility fit
- budget fit

Keep the existing strict JSON response shape exactly: reply, cards, suggested_questions, and meta. Do not include markdown or extra text outside the JSON.`;

  return prompt.slice(0, 2000);
}
