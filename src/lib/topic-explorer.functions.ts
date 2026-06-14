import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  topics: z.array(z.string().min(1).max(40)).min(1).max(8),
});

const SYSTEM_PROMPT = `You are Link OS, the AI guide inside the Links social app (14+, motto "United we stand").
A user just picked topics they love. For EACH topic, return a short, energetic guide so they feel welcomed:
- 2 suggested groups to join (catchy names + 1-line vibe)
- 2 notable people or creators in that space (name + why they matter, keep it age-appropriate)
- 1 quick history beat (one sentence)
- 2 fun facts (one sentence each)

Tone: warm, curious, Gen-Z friendly, no condescension. Keep every string under ~140 chars. No markdown, no emojis in field values.`;

export const exploreTopics = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Topics: ${data.topics.join(", ")}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_topic_guides",
              description: "Return guides for each requested topic",
              parameters: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        topic: { type: "string" },
                        intro: { type: "string" },
                        groups: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              vibe: { type: "string" },
                            },
                            required: ["name", "vibe"],
                          },
                        },
                        people: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              why: { type: "string" },
                            },
                            required: ["name", "why"],
                          },
                        },
                        history: { type: "string" },
                        facts: { type: "array", items: { type: "string" } },
                      },
                      required: ["topic", "intro", "groups", "people", "history", "facts"],
                    },
                  },
                },
                required: ["topics"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_topic_guides" } },
      }),
    });

    if (res.status === 429) throw new Error("Link OS is busy — try again in a sec.");
    if (res.status === 402) throw new Error("Link OS is out of credits.");
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Lovable AI error", res.status, body);
      throw new Error(`AI gateway error ${res.status}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { topics: [] };
    try {
      return JSON.parse(args) as {
        topics: Array<{
          topic: string;
          intro: string;
          groups: { name: string; vibe: string }[];
          people: { name: string; why: string }[];
          history: string;
          facts: string[];
        }>;
      };
    } catch {
      return { topics: [] };
    }
  });