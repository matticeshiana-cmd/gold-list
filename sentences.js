export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { word } = req.body || {};
  if (!word) return res.status(400).json({ error: "No word provided" });

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: `You are a native Korean speaker and language expert. Generate 8 diverse, natural Korean sentences using the given word. Each sentence must demonstrate a DIFFERENT nuance, register, or real-life context. The goal is to show a learner the full range of how native speakers actually use this word.

Return ONLY valid JSON, no markdown:
{
  "word": "string",
  "sentences": [
    {
      "korean": "string — natural Korean sentence with the word used authentically",
      "english": "string — natural English translation",
      "register": "formal|casual|written|spoken|academic|literary",
      "nuance": "string — 2-3 sentences explaining what THIS specific usage reveals: the emotional weight, the social context, the grammatical pattern, why a native speaker would reach for this word here specifically, and how it differs from related words in this context"
    }
  ]
}

Rules:
- Make the 8 sentences genuinely diverse: different grammatical forms, topics, registers, emotional tones
- The nuance note is the most important part — be specific and educational, not generic
- Show edge cases, idiomatic uses, and subtle connotations, not just textbook examples
- Include at least one negative context, one emotional context, one professional context, one casual spoken context
- If the word is a homonym, generate sentences for all major meanings`,
      messages: [{ role: "user", content: word }]
    })
  });

  const data = await resp.json();
  return res.status(resp.status).json(data);
}
