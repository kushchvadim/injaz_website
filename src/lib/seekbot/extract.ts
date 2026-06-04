import type { NormalizedToolCall } from './types';

export function safeJsonParse(value: unknown): unknown {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string') return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function collectTextFromContent(content: unknown): string[] {
  if (typeof content === 'string') return [content];
  if (!Array.isArray(content)) return [];

  return content.flatMap((block) => {
    if (typeof block === 'string') return [block];
    if (!block || typeof block !== 'object') return [];
    const record = block as Record<string, unknown>;
    if (typeof record.text === 'string') return [record.text];
    if (typeof record.output_text === 'string') return [record.output_text];
    if (record.text && typeof record.text === 'object' && typeof (record.text as Record<string, unknown>).value === 'string') {
      return [(record.text as Record<string, string>).value];
    }
    return collectTextFromContent(record.content);
  });
}

export function extractText(response: unknown): string {
  if (!response || typeof response !== 'object') return '';
  const record = response as Record<string, unknown>;

  if (typeof record.output_text === 'string' && record.output_text.trim()) {
    return record.output_text;
  }

  const output = Array.isArray(record.output) ? record.output : [];
  const outputTexts = output.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const outputItem = item as Record<string, unknown>;
    if (typeof outputItem.text === 'string') return [outputItem.text];
    if (typeof outputItem.output_text === 'string') return [outputItem.output_text];
    return collectTextFromContent(outputItem.content);
  });

  const directContentTexts = collectTextFromContent(record.content);
  return [...outputTexts, ...directContentTexts].join('\n').trim();
}

export function normalizeToolCall(rawCall: unknown): NormalizedToolCall | undefined {
  if (!rawCall || typeof rawCall !== 'object') return undefined;
  const call = rawCall as Record<string, unknown>;

  const nestedFunction = call.function && typeof call.function === 'object' ? (call.function as Record<string, unknown>) : undefined;
  const name = call.name ?? nestedFunction?.name;
  const callId = call.call_id ?? call.id ?? nestedFunction?.call_id;
  const args = call.arguments ?? nestedFunction?.arguments ?? call.input ?? nestedFunction?.input;

  if (typeof name !== 'string' || typeof callId !== 'string') return undefined;

  return {
    id: typeof call.id === 'string' ? call.id : undefined,
    call_id: callId,
    name,
    arguments: safeJsonParse(args) ?? args ?? {},
  };
}

function collectToolCalls(value: unknown, results: NormalizedToolCall[], depth = 0): void {
  if (depth > 5 || !value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach((item) => collectToolCalls(item, results, depth + 1));
    return;
  }

  const record = value as Record<string, unknown>;
  const type = typeof record.type === 'string' ? record.type : '';
  const maybeCall = normalizeToolCall(record);

  if (maybeCall && (type === 'function_call' || type === 'tool_call' || type === 'function' || 'function' in record || 'arguments' in record)) {
    results.push(maybeCall);
    return;
  }

  if (Array.isArray(record.tool_calls)) collectToolCalls(record.tool_calls, results, depth + 1);
  if (Array.isArray(record.content)) collectToolCalls(record.content, results, depth + 1);
}

export function extractToolCalls(response: unknown): NormalizedToolCall[] {
  if (!response || typeof response !== 'object') return [];
  const record = response as Record<string, unknown>;
  const results: NormalizedToolCall[] = [];

  collectToolCalls(record.output, results);
  collectToolCalls(record.tool_calls, results);
  collectToolCalls(record.content, results);

  const seen = new Set<string>();
  return results.filter((call) => {
    const key = `${call.call_id}:${call.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function stripJsonFences(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}
