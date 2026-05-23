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
      max_tokens: 4096,
      system: `Korean language expert. Generate 6 diverse natural Korean sentences using the given word. Return ONLY valid JSON, no markdown.
{"sentences":[{"korean":"string","english":"string","register":"formal|casual|written|spoken|academic","nuance":"2-3 sentences explaining this specific usage and what it reveals about the word"}]}
Show different registers, contexts, emotional tones, and grammatical forms. Each nuance note must explain WHY a native speaker reaches for this word in this specific context.`,
      messages: [{ role: "user", content: word }]
    })
  });

  const data = await resp.json();
  return res.status(resp.status).json(data);
}
