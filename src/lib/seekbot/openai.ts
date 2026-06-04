import { SEEKBOT_SYSTEM_PROMPT } from './prompt';
import { extractText, extractToolCalls } from './extract';
import { normalizeSearchArgs, searchOpportunities, searchOpportunitiesTool } from './tools';
import type { ChatMessage } from './types';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-4.1-mini';
const DEFAULT_TIMEOUT_MS = 20000;

const finalResponseTextFormat = {
  format: {
    type: 'json_schema',
    name: 'seekbot_response',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        reply: { type: 'string' },
        cards: {
          type: 'array',
          maxItems: 5,
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              match_score: { type: 'number' },
              why_match: { type: 'string' },
              recommended_package: { type: 'string' },
              suggested_budget: { type: 'string' },
              cta_label: { type: 'string' },
            },
            required: ['id', 'title', 'match_score', 'why_match', 'recommended_package', 'suggested_budget', 'cta_label'],
          },
        },
        suggested_questions: { type: 'array', items: { type: 'string' }, maxItems: 4 },
        meta: {
          type: 'object',
          additionalProperties: false,
          properties: {
            used_tool: { type: 'boolean' },
            status: { type: 'string', enum: ['ok', 'fallback'] },
          },
          required: ['used_tool', 'status'],
        },
      },
      required: ['reply', 'cards', 'suggested_questions', 'meta'],
    },
  },
} as const;

interface CreateSeekBotCompletionArgs {
  message: string;
  messages: ChatMessage[];
}

interface OpenAIResponseLike {
  id?: string;
  output?: unknown;
  [key: string]: unknown;
}

function envNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function createResponse(payload: Record<string, unknown>): Promise<OpenAIResponseLike> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), envNumber('SEEKBOT_TIMEOUT_MS', DEFAULT_TIMEOUT_MS));

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      await response.text().catch(() => '');
      throw new Error(`OpenAI Responses API request failed with status ${response.status}`);
    }

    return (await response.json()) as OpenAIResponseLike;
  } finally {
    clearTimeout(timeout);
  }
}

function buildInput(message: string, messages: ChatMessage[]): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  return [
    { role: 'system', content: SEEKBOT_SYSTEM_PROMPT },
    ...messages.map((chatMessage) => ({ role: chatMessage.role, content: chatMessage.content })),
    { role: 'user', content: message },
  ];
}

function buildBasePayload(message: string, messages: ChatMessage[]): Record<string, unknown> {
  return {
    model: process.env.SEEKBOT_MODEL || DEFAULT_MODEL,
    input: buildInput(message, messages),
    tools: [searchOpportunitiesTool],
    tool_choice: 'auto',
    parallel_tool_calls: false,
    max_output_tokens: 1200,
    text: finalResponseTextFormat,
  };
}

export async function createSeekBotCompletion(args: CreateSeekBotCompletionArgs): Promise<{ text: string; usedTool: boolean }> {
  let response = await createResponse(buildBasePayload(args.message, args.messages));
  let usedTool = false;

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const toolCalls = extractToolCalls(response);
    if (toolCalls.length === 0) break;

    usedTool = true;
    const functionCallOutputs = toolCalls.map((toolCall) => {
      const output = toolCall.name === 'search_opportunities'
        ? searchOpportunities(normalizeSearchArgs(toolCall.arguments))
        : { status: 'error', error: `Unknown tool: ${toolCall.name}` };

      return {
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify(output),
      };
    });

    if (!response.id) {
      throw new Error('OpenAI Responses API response did not include an id for tool continuation.');
    }

    response = await createResponse({
      model: process.env.SEEKBOT_MODEL || DEFAULT_MODEL,
      previous_response_id: response.id,
      input: functionCallOutputs,
      tools: [searchOpportunitiesTool],
      tool_choice: 'auto',
      parallel_tool_calls: false,
      max_output_tokens: 1200,
      text: finalResponseTextFormat,
    });
  }

  return { text: extractText(response), usedTool };
}
