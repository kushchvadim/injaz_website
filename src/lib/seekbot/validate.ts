import type { ChatMessage, SeekBotRequest, SeekBotResponse } from './types';
import { safeJsonParse, stripJsonFences } from './extract';
import { getOpportunityById } from './tools';

export const fallbackSeekBotResponse: SeekBotResponse = {
  reply: 'I found some relevant sponsorship opportunities, but could not format the full result. Please try again.',
  cards: [],
  suggested_questions: ['Try a more specific search', 'Search by location', 'Search by audience'],
  meta: {
    used_tool: false,
    status: 'fallback',
  },
};

export function validateRequestBody(raw: unknown): { ok: true; value: SeekBotRequest } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }

  const body = raw as Record<string, unknown>;
  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return { ok: false, error: 'message is required.' };
  }

  if (body.message.length > 2000) {
    return { ok: false, error: 'message must be 2000 characters or fewer.' };
  }

  const messages: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages
        .filter((message): message is Record<string, unknown> => Boolean(message) && typeof message === 'object')
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .filter((message) => typeof message.content === 'string')
        .map((message) => ({ role: message.role as ChatMessage['role'], content: String(message.content).slice(0, 4000) }))
        .slice(-20)
    : [];

  const clientContext = body.clientContext && typeof body.clientContext === 'object' ? body.clientContext as Record<string, unknown> : {};

  return {
    ok: true,
    value: {
      message: body.message.trim(),
      messages,
      clientContext: {
        sessionId: typeof clientContext.sessionId === 'string' ? clientContext.sessionId.slice(0, 200) : undefined,
        cookieConsent: typeof clientContext.cookieConsent === 'boolean' ? clientContext.cookieConsent : undefined,
      },
    },
  };
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function clampScore(value: unknown): number {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function validateFinalResponse(finalText: string, usedTool: boolean): SeekBotResponse {
  const parsed = safeJsonParse(stripJsonFences(finalText));
  if (!parsed || typeof parsed !== 'object') {
    return { ...fallbackSeekBotResponse, meta: { used_tool: usedTool, status: 'fallback' } };
  }

  const record = parsed as Record<string, unknown>;
  const meta = record.meta && typeof record.meta === 'object' ? record.meta as Record<string, unknown> : undefined;

  if (
    typeof record.reply !== 'string' ||
    !Array.isArray(record.cards) ||
    !Array.isArray(record.suggested_questions) ||
    !meta ||
    typeof meta.used_tool !== 'boolean' ||
    (meta.status !== 'ok' && meta.status !== 'fallback')
  ) {
    return { ...fallbackSeekBotResponse, meta: { used_tool: usedTool, status: 'fallback' } };
  }

  const cards = record.cards;
  const validCards = cards
    .filter((card): card is Record<string, unknown> => Boolean(card) && typeof card === 'object' && typeof (card as Record<string, unknown>).id === 'string')
    .map((card) => {
      const opportunity = getOpportunityById(String(card.id));
      if (!opportunity) return undefined;

      return {
        id: opportunity.id,
        title: asString(card.title, opportunity.title) || opportunity.title,
        match_score: clampScore(card.match_score),
        why_match: asString(card.why_match, 'Relevant to your sponsorship objectives.').slice(0, 500),
        recommended_package: asString(card.recommended_package, 'Starter sponsorship package').slice(0, 300),
        suggested_budget: asString(card.suggested_budget, `AED ${opportunity.budget_min.toLocaleString()}–${opportunity.budget_max.toLocaleString()}`).slice(0, 120),
        cta_label: asString(card.cta_label, 'View opportunity') || 'View opportunity',
      };
    })
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .slice(0, 5);

  const suggestedQuestions = (Array.isArray(record.suggested_questions) ? record.suggested_questions : [])
    .filter((question): question is string => typeof question === 'string' && question.trim().length > 0)
    .map((question) => question.trim().slice(0, 160))
    .slice(0, 4);

  return {
    reply: asString(record.reply, 'Here are sponsorship opportunities that match your objectives.').slice(0, 1500),
    cards: validCards,
    suggested_questions: suggestedQuestions.length > 0 ? suggestedQuestions : ['Search by location', 'Search by audience', 'Compare CSR opportunities'],
    meta: {
      used_tool: usedTool,
      status: 'ok',
    },
  };
}
