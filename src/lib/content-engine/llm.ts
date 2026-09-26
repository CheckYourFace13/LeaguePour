/**
 * Minimal Anthropic Messages API wrapper - no SDK dependency, this is the only place in the repo
 * that calls an LLM. Requires ANTHROPIC_API_KEY (see .env.example) - callers should treat a
 * missing key as a normal "content engine not configured yet" condition, not a crash.
 */
const ANTHROPIC_MODEL = "claude-sonnet-5";
const API_URL = "https://api.anthropic.com/v1/messages";

export class LlmNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set - content engine generation is disabled until it is configured.");
    this.name = "LlmNotConfiguredError";
  }
}

export async function callClaude(input: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new LlmNotConfiguredError();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: input.maxTokens ?? 4096,
      system: input.system,
      messages: [{ role: "user", content: input.prompt }],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Anthropic API returned no text content.");
  return text;
}

/** Strips a ```json ... ``` fence if present, then JSON.parses. Throws with the raw text on failure
 * so a bad LLM response is a visible, diagnosable error - never silently coerced into a fallback. */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  try {
    return JSON.parse(raw.trim()) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse JSON from LLM response: ${err instanceof Error ? err.message : String(err)}. Raw text: ${raw.slice(0, 1000)}`,
    );
  }
}
