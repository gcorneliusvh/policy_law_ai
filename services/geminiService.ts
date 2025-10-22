import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { FullAnalysis, Contract } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = "gemini-2.5-pro";

const responseSchema = {
    type: Type.OBJECT,
    properties: {
      dashboardSummary: {
        type: Type.OBJECT,
        properties: {
          keyThemes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Key themes identified across all policies.",
          },
          commonClauses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                clause: { type: Type.STRING, description: "The name of the common clause/policy area." },
                description: { type: Type.STRING, description: "A brief description of the clause's purpose." },
                frequency: { type: Type.NUMBER, description: "The percentage of countries sharing this clause/policy." },
              },
              required: ["clause", "description", "frequency"],
            },
            description: "Clauses or policy areas that appear frequently.",
          },
          divergentApproaches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                approach: { type: Type.STRING, description: "The name of the divergent approach." },
                description: { type: Type.STRING, description: "A description of how this approach differs from others." },
                examples: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific countries that use this approach.",
                },
              },
              required: ["approach", "description", "examples"],
            },
            description: "Different ways countries handle a similar topic.",
          },
        },
        required: ["keyThemes", "commonClauses", "divergentApproaches"],
      },
      contracts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER, description: "A unique identifier for the policy, starting from 0." },
            country: { type: Type.STRING, description: "The country associated with the policy." },
            policyTitle: { type: Type.STRING, description: "The official title or a descriptive name of the policy." },
            summary: { type: Type.STRING, description: "A concise summary of the policy's key points, specifically highlighting notable differences from Canadian policies." },
            suggestions: { type: Type.STRING, description: "Actionable suggestions for improving or aligning the policy based on the comparative analysis." },
          },
          required: ["id", "country", "policyTitle", "summary", "suggestions"],
        },
        description: "An array of detailed analyses for each individual country's policy.",
      },
    },
    required: ["dashboardSummary", "contracts"],
};

export async function generateAnalysisFromPrompt(promptText: string, countries: string[]): Promise<FullAnalysis> {
    const prompt = `
      Analyze government policies related to "${promptText}" for the following countries: ${countries.join(', ')}.
  
      Your task is to perform a comprehensive comparison and provide a detailed analysis in the specified JSON format.
  
      **Instructions:**
      1.  **Overall Dashboard Summary:**
          *   Identify 3-5 high-level **key themes** that emerge across all policies.
          *   Pinpoint the **most common clauses** or policy areas. For each, provide its name, a brief description, and its frequency as a percentage.
          *   Highlight significant **divergent approaches** where countries handle the same topic differently.
      2.  **Individual Policy Analysis:**
          *   For each country, create a separate entry.
          *   Assign a unique 'id' starting from 0.
          *   Identify the 'country' and a descriptive 'policyTitle'.
          *   Provide a detailed 'summary' of its main provisions. **Crucially, for each summary, you MUST highlight notable differences from Canadian policies on the same topic.**
          *   Offer concrete 'suggestions' for improvement for each policy.
  
      Please find the relevant, up-to-date policies and provide the full analysis in the specified JSON structure.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });
  
      const jsonString = response.text.trim();
      const result: FullAnalysis = JSON.parse(jsonString);
  
      result.contracts.sort((a, b) => a.id - b.id);
      return result;
    } catch (error) {
      console.error("Error analyzing policies with Gemini:", error);
      throw new Error("Failed to analyze policies. The model may have had trouble finding data or structuring the response.");
    }
}

let chat: Chat | null = null;
export function startChat(analysis: FullAnalysis): void {
  const contractContext = analysis.contracts.map(c => `
    **Policy: ${c.policyTitle} (${c.country})**
    Summary (vs. Canada): ${c.summary}
    Suggestions: ${c.suggestions}
  `).join('\n\n');

  const dashboardContext = `
    **Dashboard Summary**
    Key Themes: ${analysis.dashboardSummary.keyThemes.join(', ')}
    Common Clauses: ${analysis.dashboardSummary.commonClauses.map(cc => cc.clause).join(', ')}
    Divergent Approaches: ${analysis.dashboardSummary.divergentApproaches.map(da => da.approach).join(', ')}
  `;

  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are an expert policy analysis assistant. Your knowledge base is strictly limited to the analysis provided below. Answer questions based ONLY on this context. Pay special attention to comparisons with Canadian policy. If the answer isn't in the context, state that clearly.

      **CONTEXT:**
      ${dashboardContext}
      
      ${contractContext}
      `
    }
  });
}

export async function sendMessage(message: string): Promise<string> {
  if (!chat) {
    throw new Error("Chat not initialized. Call startChat first.");
  }
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to get a response from the chat agent.");
  }
}
