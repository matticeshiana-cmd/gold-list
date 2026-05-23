export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { sentence } = req.body || {};
  if (!sentence) return res.status(400).json({ error: "No sentence provided" });

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: `You are a native Korean speaker and patient Korean language teacher. A student learning Korean has written a sentence. Correct it and give detailed, encouraging feedback. Return ONLY valid JSON, no markdown.

Schema:
{
  "original": "string (the student's original sentence)",
  "corrected": "string (the fully corrected natural Korean sentence)",
  "isCorrect": boolean (true only if the sentence is already completely natural and correct),
  "errors": [
    {
      "mistake": "string (the specific part that was wrong)",
      "correction": "string (the correct form)",
      "type": "grammar|vocabulary|spelling|naturalness|word-choice",
      "explanation": "string (clear explanation of WHY it is wrong and what the correct form means — be specific and educational)"
    }
  ],
  "tip": "string (one practical tip to help them remember the correct form next time)",
  "encouragement": "string (honest, warm encouragement — acknowledge what they did well, motivate them)"
}

Rules:
- If the sentence is perfect, errors should be an empty array and isCorrect should be true
- Explain grammar rules in plain English, reference Korean grammar concepts by name (e.g. topic marker 은/는, object marker 을/를)
- Be specific: quote the exact mistake, not vague descriptions
- Keep explanations concise but complete — 1-3 sentences each`,
      messages: [{ role: "user", content: sentence }]
    })
  });

  const data = await resp.json();
  return res.status(resp.status).json(data);
}
