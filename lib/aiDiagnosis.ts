type AnalysisResult = {
  engagementScore?: { local?: number; global?: number };
  analysis: unknown;
};

export type AiDiagnosis = {
  conclusion: string;
  coreProblem: string;
  expectedRoi: string;
  targetGroup: string;
  targetReasoning: string;
  platform: string;
  platformReasoning: string;
  dimensions: Array<{ title: string; body: string }>;
  steps: Array<{ priority: string; tag: string; title: string; detail: string }>;
  highlightStats: Array<{ label: string; value: string }>;
};

export type AiDiagnosisBundle = {
  provider: "api";
  model: string;
  generatedAt: string;
  content: {
    zh: AiDiagnosis;
    en: AiDiagnosis;
  };
};

function hasDiagnosisShape(value: unknown): value is AiDiagnosis {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.conclusion === "string" &&
    typeof item.coreProblem === "string" &&
    typeof item.expectedRoi === "string" &&
    typeof item.targetGroup === "string" &&
    typeof item.targetReasoning === "string" &&
    typeof item.platform === "string" &&
    typeof item.platformReasoning === "string" &&
    Array.isArray(item.dimensions) &&
    item.dimensions.length > 0 &&
    Array.isArray(item.steps) &&
    item.steps.length > 0 &&
    Array.isArray(item.highlightStats)
  );
}

function parseJsonContent(content: string) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned) as unknown;
}

function endpointUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/chat/completions") ? trimmed : `${trimmed}/chat/completions`;
}

export async function requestAiDiagnosis(
  input: Record<string, unknown>,
  result: AnalysisResult
): Promise<AiDiagnosisBundle | null> {
  const baseUrl = process.env.AI_API_URL?.trim();
  const model = process.env.AI_MODEL?.trim();
  if (!baseUrl || !model) return null;

  const timeoutMs = Math.max(5_000, Number(process.env.AI_TIMEOUT_MS ?? 45_000));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const schema = {
    zh: {
      conclusion: "string",
      coreProblem: "string",
      expectedRoi: "string",
      targetGroup: "string",
      targetReasoning: "string",
      platform: "string",
      platformReasoning: "string",
      dimensions: [{ title: "string", body: "string" }],
      steps: [{ priority: "P0", tag: "string", title: "string", detail: "string" }],
      highlightStats: [{ label: "string", value: "string" }],
    },
    en: {
      conclusion: "string",
      coreProblem: "string",
      expectedRoi: "string",
      targetGroup: "string",
      targetReasoning: "string",
      platform: "string",
      platformReasoning: "string",
      dimensions: [{ title: "string", body: "string" }],
      steps: [{ priority: "P0", tag: "string", title: "string", detail: "string" }],
      highlightStats: [{ label: "string", value: "string" }],
    },
  };

  try {
    const response = await fetch(endpointUrl(baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_API_KEY ? { Authorization: `Bearer ${process.env.AI_API_KEY}` } : {}),
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a hotel social-media video analyst. Base every conclusion on the supplied metrics. Return valid JSON only, without markdown or extra commentary.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Generate concise, actionable diagnoses in Chinese and English. Include exactly 3 dimensions, 3 prioritized steps, and 4 highlight stats in each language.",
              outputSchema: schema,
              submission: input,
              indicators: result,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API returned ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI API returned no message content");

    const parsed = parseJsonContent(content) as { zh?: unknown; en?: unknown };
    if (!hasDiagnosisShape(parsed.zh) || !hasDiagnosisShape(parsed.en)) {
      throw new Error("AI API response does not match the diagnosis schema");
    }

    return {
      provider: "api",
      model,
      generatedAt: new Date().toISOString(),
      content: { zh: parsed.zh, en: parsed.en },
    };
  } catch (error) {
    console.error("AI diagnosis unavailable; using built-in diagnosis:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
