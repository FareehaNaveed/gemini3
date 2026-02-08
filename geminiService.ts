import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_CORE = `
# CIPHERSYNC MASTER ENGINE 
You are an Elite Security Intelligence Agent for CipherSync.
- Output: PURE JSON. 
- No markdown wrappers, no backticks, no underscores in labels.
- Format: Professional, technical, zero-filler.
`;

const SOC_EXPERT_PROMPT = `
You are a Tier 3 SOC (Security Operations Center) Engineer at CipherSync. 
Your goal is to provide PhD-level defensive research and incident command logic.

RULES:
1. If asked about "Illegal" or "Hacking" topics: 
   - ALWAYS pivot to a DEFENSIVE stance. 
   - Explain the technical theory (e.g., how the exploit works) purely for the purpose of building stronger shields and detection rules.
2. If asked legal advice: 
   - State: "CipherSync provides security logic, not legal counsel."
3. Style: Professional, precise, technical.
`;

export const cleanText = (text: string | undefined): string => {
  if (!text) return '';
  return text.replace(/[#*_~`]/g, '').trim();
};

export const runCodeAudit = async (code: string, imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { text: `${SYSTEM_CORE}
        MODULE: CODE DEFENSIVE AUDITOR
        Perform SAST on the provided code. Identify vulnerabilities.
        For each, provide: Title, Severity (CRITICAL, WARNING, INFO), Impact, and a specific Fix Snippet.
        Also provide a fullRemediatedCode block which is the complete, original file with all security patches applied.
        PAYLOAD: ${code}` },
      ...(imageBase64 ? [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }] : [])
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vulnerabilities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                severity: { type: Type.STRING },
                impact: { type: Type.STRING },
                fixSnippet: { type: Type.STRING }
              },
              required: ["title", "severity", "impact", "fixSnippet"]
            }
          },
          summary: { type: Type.STRING },
          fullRemediatedCode: { type: Type.STRING }
        },
        required: ["vulnerabilities", "summary", "fullRemediatedCode"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("JSON Parse Error in Code Audit", e);
    return { vulnerabilities: [], summary: "Parsing Error", fullRemediatedCode: code };
  }
};

export const runCloudGuard = async (config: string, imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { text: `${SYSTEM_CORE}
        MODULE: CLOUD GUARD
        Analyze infrastructure for misconfigurations and toxic combinations.
        Provide a score (0-100), findings list, and executive summary.
        CONFIG: ${config}` },
      ...(imageBase64 ? [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }] : [])
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                severity: { type: Type.STRING },
                blastRadius: { type: Type.STRING },
                remediation: { type: Type.STRING }
              },
              required: ["title", "severity", "blastRadius", "remediation"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["score", "findings", "summary"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { score: 0, findings: [], summary: "Analysis Failed" };
  }
};

export const runSOCChat = async (history: { role: string; text: string }[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: SYSTEM_CORE + "\n" + SOC_EXPERT_PROMPT,
      temperature: 0.7,
    }
  });

  return cleanText(response.text);
};

export const runIntelScan = async (type: 'URL' | 'USER' | 'BREACH', input: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `${SYSTEM_CORE} \nMODULE: INTEL CENTER \nRECON TYPE: ${type} \nINPUT: ${input}`;
  const response = await ai.models.generateContent({ 
    model: 'gemini-3-flash-preview', 
    contents: prompt 
  });
  return cleanText(response.text);
};

export const runUrlAnalysis = async (url: string) => runIntelScan('URL', url);
export const runOsintSearch = async (query: string) => runIntelScan('USER', query);
export const checkDataBreach = async (identifier: string) => runIntelScan('BREACH', identifier);