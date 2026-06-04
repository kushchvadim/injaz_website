import { createSeekBotCompletion } from '../../src/lib/seekbot/openai';
import { fallbackSeekBotResponse, validateFinalResponse, validateRequestBody } from '../../src/lib/seekbot/validate';

export const config = { path: '/api/seekbot' };

function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function parseJsonSafely(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const body = await parseJsonSafely(request);
  const validation = validateRequestBody(body);

  if (!validation.ok) {
    return jsonResponse(400, { error: validation.error });
  }

  try {
    const completion = await createSeekBotCompletion({
      message: validation.value.message,
      messages: validation.value.messages ?? [],
    });

    return jsonResponse(200, validateFinalResponse(completion.text, completion.usedTool));
  } catch (error) {
    console.error('SeekBot server error', error instanceof Error ? error.message : 'Unknown error');
    return jsonResponse(500, fallbackSeekBotResponse);
  }
}
