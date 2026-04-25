import { NextRequest, NextResponse } from "next/server";
import { SETTINGS_SCHEMA } from "@/lib/settingsSchema";

// Serialised once at module load — large but static, ideal for prompt caching
const SCHEMA_CONTEXT = JSON.stringify(SETTINGS_SCHEMA, null, 2);

const SYSTEM_PROMPT = `You are a Claude Code settings assistant. Given a user's natural-language description of a desired behaviour, return the exact settings.json key and value needed.

Here are all known Claude Code settings:
<settings_schema>
${SCHEMA_CONTEXT}
</settings_schema>

Rules:
1. Return ONLY valid JSON matching this exact shape (no markdown, no code fences):
   {"key":"<string>","subKey":"<string or null>","value":<any>,"valueType":"string"|"boolean"|"number"|"json","explanation":"<one sentence>"}
2. "valueType" must be one of the four literal strings shown. Map schema "enum" types to "string", "string[]" to "json".
3. "value" must be a valid JSON-serialisable value matching "valueType".
4. "explanation" is one sentence describing what this setting does.
5. If no setting clearly matches the request, return: {"error":"No matching setting found for that description."}
6. Never return anything other than the JSON object.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      error:
        "ANTHROPIC_API_KEY is not configured. Add it to .env.local or set it as a shell environment variable before starting the dev server.",
    });
  }

  const body = await req.json().catch(() => ({})) as { query?: string };
  if (!body.query?.trim()) {
    return NextResponse.json({ error: "query is required" });
  }

  try {
    // Dynamic import keeps the Anthropic SDK out of the client bundle
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Cache the large schema system prompt after first request
          cache_control: { type: "ephemeral" },
        },
      ] as Parameters<typeof client.messages.create>[0]["system"],
      messages: [{ role: "user", content: body.query.trim() }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from model" });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(textBlock.text) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON response" });
    }

    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("401") || msg.includes("authentication")) {
      return NextResponse.json({ error: "Invalid ANTHROPIC_API_KEY" });
    }
    return NextResponse.json({ error: `API error: ${msg}` });
  }
}
