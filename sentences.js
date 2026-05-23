export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { word } = req.body || {};
  if (!word) return res.status(400).json({ error: "No word provided" });

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: `Native Korean speaker and language teacher. Generate 6 natural Korean sentences using the given word, each showing a different real-life nuance or context.

Return ONLY valid JSON:
{"sentences":[{"korean":"string","english":"string","register":"formal|casual|written|spoken|academic","nuance":"2-3 sentences explaining what this specific usage reveals about the word"}]}

Rules: diverse registers and contexts, specific educational nuance notes, include emotional/negative/professional/casual examples.`,
        messages: [{ role: "user", content: word }]
      })
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
