import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InsightInput = z.object({
  question: z.string().trim().min(3).max(2000),
  summary: z.string().max(12000).default(""),
});

const SYSTEM_PROMPT = `You are a trading performance coach for a Meteora DLMM liquidity-provider agent on Solana.
Explain the trader's results in plain language, then give 3-5 concrete, actionable next steps
(config changes, risk limits, screening filters, pools to avoid). Be honest about risk, never promise profit,
never ask for private keys or secrets. Use short markdown sections: "What happened", "Why", "Next steps". Keep under 350 words.`;

export const explainPerformance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InsightInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this app.");

    const { streamText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        system: SYSTEM_PROMPT,
        prompt: `Performance summary:\n${data.summary || "(none provided)"}\n\nTrader question:\n${data.question}`,
        maxRetries: 0,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const text = (await result.text).trim();
      if (!text) return { text: "The AI returned no answer for this question. Try rephrasing it with more detail." };
      return { text };
    } catch (error) {
      console.error(error);
      const status = (error as { statusCode?: number })?.statusCode;
      if (status === 429) throw new Error("Too many AI requests right now. Please wait a moment and try again.");
      if (status === 402) throw new Error("AI credits are used up. Add credits in your workspace to continue.");
      if (status === 403) throw new Error("AI access is blocked for this workspace.");
      throw new Error("The AI could not answer right now. Please try again later.");
    }
  });
