export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { word, mode } = req.body || {};
  if (!word) return res.status(400).json({ error: "No word provided" });

  let system;
  let maxTokens = 4096;

  if (mode === "sentences") {
    system = `Korean language expert. Generate 6 diverse natural Korean sentences using the given word. Return ONLY valid JSON, no markdown.
{"sentences":[{"korean":"string","english":"string","register":"formal|casual|written|spoken|academic","nuance":"2-3 sentences explaining this specific usage and what it reveals about the word"}]}
Show different registers, contexts, emotional tones, and grammatical forms. Each nuance note must explain WHY a native speaker reaches for this word in this specific context.`;
  } else if (mode === "correct") {
    system = `You are a native Korean speaker and Korean language teacher. A student learning Korean has written a sentence. Correct it and provide detailed feedback. Return ONLY valid JSON, no markdown.
{"original":"string","corrected":"string","isCorrect":boolean,"errors":[{"mistake":"string","correction":"string","type":"grammar|vocabulary|spelling|naturalness|word-choice","explanation":"string"}],"tip":"string","encouragement":"string"}
If isCorrect is true, errors should be empty. Be specific about each error.`;
  } else {
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
