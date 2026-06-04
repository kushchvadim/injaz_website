export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface SeekBotRequest {
  message: string;
  messages?: ChatMessage[];
  clientContext?: {
    sessionId?: string;
    cookieConsent?: boolean;
  };
}

export interface Opportunity {
  id: string;
  title: string;
  short_summary: string;
  full_description: string;
  location: string;
  category: string[];
  audience: string[];
  estimated_reach: number;
  budget_min: number;
  budget_max: number;
  sponsorship_benefits: string[];
  tags: string[];
}

export interface CompactOpportunity {
  id: string;
  title: string;
  short_summary: string;
  location: string;
  category: string[];
  audience: string[];
  estimated_reach: number;
  budget_min: number;
  budget_max: number;
  sponsorship_benefits: string[];
  tags: string[];
}

export interface SearchOpportunitiesArgs {
  query: string;
  audience: string[];
  location: string;
  categories: string[];
  budgetMin: number;
  budgetMax: number;
  limit: number;
}

export interface SearchOpportunitiesResult {
  status: 'success';
  matched_count: number;
  opportunities: CompactOpportunity[];
}

export interface SeekBotCard {
  id: string;
  title: string;
  match_score: number;
  why_match: string;
  recommended_package: string;
  suggested_budget: string;
  cta_label: string;
}

export interface SeekBotResponse {
  reply: string;
  cards: SeekBotCard[];
  suggested_questions: string[];
  meta: {
    used_tool: boolean;
    status: 'ok' | 'fallback';
  };
}

export interface NormalizedToolCall {
  id?: string;
  call_id: string;
  name: string;
  arguments: unknown;
}
