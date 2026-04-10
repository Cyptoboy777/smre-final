import "server-only";
import Groq from "groq-sdk";
import { getRequiredServerEnv, SERVER_ENV_KEYS } from "@/lib/server/env";
import { QUANT_INTELLIGENCE_SYSTEM_PROMPT } from "./prompts";

export class GroqServerClient {
  private readonly groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: getRequiredServerEnv(SERVER_ENV_KEYS.groqApiKey),
    });
  }

  async createQuantBriefing(marketData: any) {
    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: QUANT_INTELLIGENCE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze the following market microstructure data and provide an institutional briefing:\n\n${JSON.stringify(marketData, null, 2)}`,
        },
      ],
      temperature: 0.2, // Low temperature for consistent analytical output
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq API.");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
       console.error("Failed to parse Groq response as JSON:", content);
       return { 
         raw: content, 
         error: "Analysis format error. Raw output provided." 
       };
    }
  }
}
