import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ============================================================
   SERPER — Real Google Search
   Sign up FREE at https://serper.dev (2500 searches/month)
   Add to .env:  SERPER_API_KEY=your_key_here
   ============================================================ */
async function googleSearch(query) {
  const key = process.env.SERPER_API_KEY;
  if (!key) {
    console.warn("⚠️  SERPER_API_KEY missing. Add it to .env from serper.dev");
    return null;
  }

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": key
      },
      body: JSON.stringify({ q: query, num: 8, gl: "in", hl: "en" })
    });

    if (!res.ok) {
      console.error("Serper HTTP error:", res.status);
      return null;
    }

    const data = await res.json();

    // Build a rich context string for the LLM
    const parts = [];

    if (data.answerBox?.answer)   parts.push(`DIRECT ANSWER: ${data.answerBox.answer}`);
    if (data.answerBox?.snippet)  parts.push(`FEATURED SNIPPET: ${data.answerBox.snippet}`);
    if (data.knowledgeGraph?.description) parts.push(`KNOWLEDGE GRAPH: ${data.knowledgeGraph.description}`);

    const organic = (data.organic || []).slice(0, 6)
      .map(r => `• ${r.title} (${r.displayLink})\n  ${r.snippet}`)
      .join("\n");

    if (organic) parts.push(`TOP RESULTS:\n${organic}`);

    const result = parts.join("\n\n");
    console.log("✅ Serper results loaded for:", query);
    return result || null;

  } catch (err) {
    console.error("Serper error:", err.message);
    return null;
  }
}

/* ============================================================
   MAIN EXPORT
   ============================================================ */
export default async function analyzeText(text) {

  const lowerText = text.toLowerCase();
  let manipulationScore = 0;
  let techniques = [];
  let highlightedPhrases = [];
  const techniqueIntensity = { fear: 0, urgency: 0, polarization: 0, authority: 0, emotion: 0 };

  /* -------- BASIC RULE-BASED SIGNALS (just for radar, not for verdict) -------- */
  const signals = {
    fear:         ['crisis','danger','threat','disaster','emergency','destroy','attack','collapse','killed','dead','assassination','bomb','war','invasion'],
    urgency:      ['urgent','share now','immediately','before they delete','act now','forward this','spread this'],
    authority:    ['government','official','expert','scientist','doctor','breaking','confirmed','sources say'],
    polarization: ['enemy','divide','against us','us vs them','powerful elites','corrupt'],
    emotion:      ['shocking','outrageous','unbelievable','heartbreaking','tragic','wake up','exposed']
  };

  const signalLabels = {
    fear: "Fear Appeal", urgency: "Urgency Trigger",
    authority: "Authority Bias", polarization: "Polarization", emotion: "Emotional Manipulation"
  };

  Object.entries(signals).forEach(([key, words]) => {
    const matches = words.filter(w => lowerText.includes(w));
    if (matches.length > 0) {
      techniques.push(signalLabels[key]);
      manipulationScore += matches.length * (key === 'urgency' ? 18 : key === 'fear' ? 15 : key === 'authority' ? 10 : 7);
      matches.forEach(w => {
        const m = text.match(new RegExp(w, "i"));
        if (m) highlightedPhrases.push(m[0]);
      });
      techniqueIntensity[key] = Math.min(matches.length * 0.3, 1);
    }
  });

  if (manipulationScore > 95) manipulationScore = 95;

  /* -------- STEP 1: SEARCH THE INTERNET -------- */
  // Ask LLM to generate the best search query for this claim
  let searchQuery = text.trim().slice(0, 100);
  try {
    const qRes = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "Convert the following claim into the best Google search query to fact-check it. Return ONLY the search query, nothing else. Max 10 words."
        },
        { role: "user", content: text }
      ],
      temperature: 0.1,
      max_tokens: 25
    });
    searchQuery = qRes.choices[0].message.content.trim().replace(/["']/g, "");
  } catch (e) { /* use raw text as fallback */ }

  console.log("🔍 Query:", searchQuery);
  const searchResults = await googleSearch(searchQuery);

  /* -------- STEP 2: LLM FACT-CHECKS USING REAL SEARCH RESULTS -------- */
  let factCheckVerdict = "UNVERIFIED";
  let factCheckReason  = "";
  let aiResult         = null;

  const systemPrompt = `You are a professional fact-checker and misinformation analyst.

${searchResults
  ? `You have REAL Google search results for the claim. Base your entire verdict on these results — do NOT use your training knowledge to override what the search results say.`
  : `You have NO search results. Use your training knowledge strictly. Be conservative — if you cannot clearly confirm something is true, mark it UNVERIFIED or FAKE.`
}

Analyze the message for:
1. FACT-CHECK: Is the claim true, false, or misleading based on evidence?
2. MANIPULATION: What psychological techniques are used to make it spread?

Return ONLY valid JSON (no markdown):
{
  "manipulationScore": number (0-95),
  "viralityRisk": "LOW" | "MEDIUM" | "HIGH",
  "techniques": ["technique1"],
  "highlightedPhrases": ["phrase1"],
  "factCheckVerdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED",
  "factCheckReason": "one sentence: exactly what the evidence shows",
  "explanation": "2-3 sentences explaining both the fact-check result and any manipulation",
  "techniqueIntensity": {
    "fear": 0.0, "urgency": 0.0, "polarization": 0.0,
    "authority": 0.0, "emotion": 0.0
  }
}

VERDICT RULES:
- REAL: Evidence clearly confirms the claim is true
- FAKE: Evidence clearly contradicts the claim, OR claim makes no sense factually
- MISLEADING: Partially true but missing important context or exaggerated
- UNVERIFIED: No clear evidence either way (future events, opinions, niche facts)

SCORE RULES:
- Verified true, no manipulation → 0–15
- True but sensationalized → 15–35
- Unverifiable or unclear → 35–55
- Misleading, distorted facts → 55–72
- Clear fake news, propaganda → 72–95`;

  const userPrompt = searchResults
    ? `CLAIM TO ANALYZE:\n"${text}"\n\nGOOGLE SEARCH RESULTS:\n${searchResults}\n\nFact-check this claim using the search results above.`
    : `CLAIM TO ANALYZE:\n"${text}"\n\nNo search results available. Analyze using your knowledge.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 800
    });

    let raw = completion.choices[0].message.content || "";
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const s = raw.indexOf("{");
    const e = raw.lastIndexOf("}");
    if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1);

    aiResult = JSON.parse(raw);
    factCheckVerdict = aiResult.factCheckVerdict || "UNVERIFIED";
    factCheckReason  = aiResult.factCheckReason  || "";

  } catch (err) {
    console.error("AI error:", err.message);
  }

  /* -------- MERGE AI RESULTS -------- */
  if (aiResult) {
    manipulationScore  = Math.max(manipulationScore, aiResult.manipulationScore || 0);
    techniques         = [...new Set([...techniques,         ...(aiResult.techniques         || [])])];
    highlightedPhrases = [...new Set([...highlightedPhrases, ...(aiResult.highlightedPhrases || [])])];
    Object.keys(techniqueIntensity).forEach(k => {
      techniqueIntensity[k] = Math.max(techniqueIntensity[k], aiResult.techniqueIntensity?.[k] || 0);
    });
  }

  /* -------- ALIGN SCORE WITH VERDICT -------- */
  if (factCheckVerdict === "FAKE"        && manipulationScore < 72) manipulationScore = 72;
  if (factCheckVerdict === "MISLEADING"  && manipulationScore < 50) manipulationScore = 50;
  if (factCheckVerdict === "REAL"        && manipulationScore > 20) manipulationScore = Math.min(manipulationScore, 20);
  if (factCheckVerdict === "UNVERIFIED"  && manipulationScore > 55) manipulationScore = Math.min(manipulationScore, 55);

  if (manipulationScore > 95) manipulationScore = 95;

  /* -------- VIRALITY -------- */
  let viralityRisk = "LOW";
  if (manipulationScore >= 60) viralityRisk = "HIGH";
  else if (manipulationScore >= 30) viralityRisk = "MEDIUM";

  /* -------- EXPLANATION -------- */
  let explanation = aiResult?.explanation || "";
  if (factCheckReason) explanation += ` Fact-check verdict: ${factCheckVerdict} — ${factCheckReason}`;
  if (!explanation) explanation = `Fact-check: ${factCheckVerdict}.`;

  /* -------- RADAR -------- */
  Object.keys(techniqueIntensity).forEach(k => {
    techniqueIntensity[k] = Math.round(techniqueIntensity[k] * 100);
  });

  console.log("✅ FINAL:", { manipulationScore, factCheckVerdict, searchResults: !!searchResults });

  return {
    manipulationScore,
    viralityRisk,
    techniques,
    highlightedPhrases,
    explanation,
    factCheckVerdict,
    factCheckReason,
    techniqueIntensity
  };
}