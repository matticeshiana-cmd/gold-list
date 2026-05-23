export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { word } = req.body || {};
  const mode = req.query.mode || "";   // read from URL: /api/lookup?mode=sentences
  if (!word) return res.status(400).json({ error: "No word provided" });

  let system, maxTokens;

  if (mode === "sentences") {
    maxTokens = 1500;
    system = `Korean language expert. Generate 4 diverse natural Korean sentences using the given word. Return ONLY valid JSON, no markdown.
{"sentences":[{"korean":"string","english":"string","register":"formal|casual|spoken","nuance":"1-2 sentences explaining this specific usage"}]}
Show 4 different registers or contexts. Nuance must explain WHY a native speaker reaches for this word here.`;
  } else if (mode === "correct") {
    maxTokens = 1500;
    system = `Native Korean speaker. Correct the student's Korean sentence. Return ONLY valid JSON, no markdown.
{"original":"string","corrected":"string","isCorrect":boolean,"errors":[{"mistake":"string","correction":"string","type":"grammar|vocabulary|spelling|naturalness","explanation":"string"}],"tip":"string","encouragement":"string"}`;
  } else {
    maxTokens = 4096;
    system = `Korean language expert. Return ONLY valid JSON, no markdown.
{"word":"string","isHomonym":boolean,"meanings":[{"hanja":"string|null","label":"string","coreMeaning":"string","exampleSentence":{"korean":"string","english":"string"},"contexts":[{"label":"string","icon":"emoji","description":"string","example":{"korean":"string","english":"string"}}],"collocations":[{"korean":"string","english":"string"}],"comparisons":[{"word":"string","nuance":"string"}],"tip":"string"}]}
4-5 contexts, 5-6 collocations, 3-5 comparisons per meaning.`;
  }

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: word }]
    })
  });

  const data = await resp.json();
  return res.status(resp.status).json(data);
}
