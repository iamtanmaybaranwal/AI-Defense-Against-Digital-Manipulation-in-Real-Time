import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ============================================================
   LANGUAGE DETECTION
   Detects the primary language of the input text so the AI
   explanation can be returned in the same language.
   ============================================================ */
async function detectLanguage(text) {
  if (!text || text.trim().length < 3) return { code: "en", name: "English" };
  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Detect the language of the given text. Return ONLY a JSON object like this (no markdown, no extra text):
{"code": "hi", "name": "Hindi"}

Common codes: en=English, hi=Hindi, mr=Marathi, bn=Bengali, ta=Tamil, te=Telugu, gu=Gujarati, kn=Kannada, pa=Punjabi, ur=Urdu, ml=Malayalam, or=Odia, ar=Arabic, fr=French, de=German, es=Spanish, zh=Chinese, ja=Japanese, ko=Korean, ru=Russian, pt=Portuguese.

For mixed Hindi+English (Hinglish), return: {"code": "hi", "name": "Hindi"}
For mixed Tamil+English, return: {"code": "ta", "name": "Tamil"}
Always pick the DOMINANT language of the text.`
        },
        { role: "user", content: text.slice(0, 300) }
      ],
      temperature: 0.0,
      max_tokens: 30
    });

    let raw = res.choices[0].message.content?.trim() || "";
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(raw);
    console.log(`🌐 Detected language: ${parsed.name} (${parsed.code})`);
    return parsed;
  } catch (err) {
    console.log("🌐 Language detection failed, defaulting to English");
    return { code: "en", name: "English" };
  }
}

/* ============================================================
   REAL GOOGLE SEARCH via Serper
   ============================================================ */
async function googleSearch(query) {
  const key = process.env.SERPER_API_KEY;
  if (!key) { console.error("❌ SERPER_API_KEY not found in .env"); return null; }
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": key },
      body: JSON.stringify({ q: query, num: 8, gl: "in", hl: "en" })
    });
    const data = await res.json();
    const parts = [];
    if (data.answerBox?.answer)           parts.push(`DIRECT ANSWER: ${data.answerBox.answer}`);
    if (data.answerBox?.snippet)          parts.push(`FEATURED SNIPPET: ${data.answerBox.snippet}`);
    if (data.knowledgeGraph?.description) parts.push(`KNOWLEDGE GRAPH: ${data.knowledgeGraph.description}`);
    if (data.knowledgeGraph?.attributes) {
      parts.push(`FACTS: ${Object.entries(data.knowledgeGraph.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
    }
    const organic = (data.organic || []).slice(0, 6).map(r => `- ${r.title}\n  ${r.snippet}`).join("\n");
    if (organic) parts.push(`SEARCH RESULTS:\n${organic}`);
    const result = parts.join("\n\n");
    console.log("\n==== SERPER RESULTS ====\n" + result.slice(0, 800) + "\n========================\n");
    return result || null;
  } catch (err) {
    console.error("Serper error:", err.message);
    return null;
  }
}

/* ============================================================
   EXTRACT TEXT + DESCRIBE IMAGE via Groq Vision
   ============================================================ */
async function extractTextFromImage(base64, mimeType) {
  console.log("🖼️  Extracting text and context from image...");
  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` }
            },
            {
              type: "text",
              text: `You are an image analyst for a misinformation detection system.

Look at this image carefully and do the following:
1. Extract ALL visible text from the image exactly as written (including headlines, captions, watermarks, hashtags, usernames, timestamps).
2. Describe what the image shows (screenshot of a tweet/WhatsApp/news? a meme? a photo with text overlay?).
3. Note any suspicious elements: manipulated visuals, out-of-context imagery, misleading headlines.

Return your response in this exact JSON format (no markdown, no extra text):
{
  "extractedText": "all visible text from the image, verbatim",
  "imageDescription": "1-2 sentence description of what the image shows",
  "suspiciousElements": "any visually suspicious elements, or 'none'"
}`
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 600
    });

    let raw = response.choices[0].message.content || "";
    console.log("\n==== VISION RESPONSE ====\n" + raw.slice(0, 600) + "\n=========================\n");

    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
    if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1);

    const parsed = JSON.parse(raw);
    return {
      extractedText:      parsed.extractedText      || "",
      imageDescription:   parsed.imageDescription   || "",
      suspiciousElements: parsed.suspiciousElements || "none"
    };
  } catch (err) {
    console.error("Vision extraction error:", err.message);
    try {
      const fallback = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            { type: "text", text: "Extract and return all visible text from this image. Just the text, nothing else." }
          ]
        }],
        temperature: 0.1,
        max_tokens: 400
      });
      const text = fallback.choices[0].message.content?.trim() || "";
      return { extractedText: text, imageDescription: "Image provided for analysis.", suspiciousElements: "none" };
    } catch (e2) {
      console.error("Vision fallback failed:", e2.message);
      return { extractedText: "", imageDescription: "Could not process image.", suspiciousElements: "none" };
    }
  }
}

/* ============================================================
   MAIN EXPORT
   ============================================================ */
export default async function analyzeText(text, imageInput = null) {

  let extractedImageText  = "";
  let imageDescription    = "";
  let suspiciousElements  = "none";

  /* -------- STEP 0: PROCESS IMAGE (if provided) -------- */
  if (imageInput?.base64 && imageInput?.mimeType) {
    const vision = await extractTextFromImage(imageInput.base64, imageInput.mimeType);
    extractedImageText  = vision.extractedText;
    imageDescription    = vision.imageDescription;
    suspiciousElements  = vision.suspiciousElements;
    console.log("📝 Extracted text:", extractedImageText.slice(0, 200));
  }

  // Combine user-typed text with extracted image text for analysis
  const combinedText = [text, extractedImageText].filter(Boolean).join("\n\n").trim();

  if (!combinedText) {
    return {
      manipulationScore: 0, viralityRisk: "LOW", techniques: [], highlightedPhrases: [],
      explanation: "No analyzable content found in the image or text.",
      factCheckVerdict: "UNVERIFIED", factCheckReason: "",
      techniqueIntensity: { fear: 0, urgency: 0, polarization: 0, authority: 0, emotion: 0 },
      extractedImageText: extractedImageText || null,
      detectedLanguage: "English"
    };
  }

  /* -------- STEP 0.5: DETECT LANGUAGE -------- */
  // Use original user-typed text for language detection (not the extracted image text)
  // so we match the user's input language, not the image's text language
  const langSource = text?.trim() || extractedImageText;
  const detectedLang = await detectLanguage(langSource);
  const isEnglish = detectedLang.code === "en";

  /* -------- RULE-BASED SIGNALS -------- */
  const lowerText = combinedText.toLowerCase();
  let manipulationScore = 0;
  let techniques = [];
  let highlightedPhrases = [];
  const techniqueIntensity = { fear: 0, urgency: 0, polarization: 0, authority: 0, emotion: 0 };

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

  if (suspiciousElements && suspiciousElements.toLowerCase() !== 'none') {
    manipulationScore += 15;
    techniques.push("Visual Manipulation");
  }

  Object.entries(signals).forEach(([key, words]) => {
    const matches = words.filter(w => lowerText.includes(w));
    if (matches.length > 0) {
      techniques.push(signalLabels[key]);
      manipulationScore += matches.length * (key === 'urgency' ? 18 : key === 'fear' ? 15 : key === 'authority' ? 10 : 7);
      matches.forEach(w => { const m = combinedText.match(new RegExp(w, "i")); if (m) highlightedPhrases.push(m[0]); });
      techniqueIntensity[key] = Math.min(matches.length * 0.3, 1);
    }
  });
  if (manipulationScore > 95) manipulationScore = 95;

  /* -------- STEP 1: GET SEARCH QUERY -------- */
  let searchQuery = combinedText.slice(0, 200).trim();
  try {
    const qRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Turn this claim into a Google search query to fact-check it.
Return ONLY the query in ENGLISH. Max 8 words. No punctuation at end.
Examples:
- "India is the largest economy" → largest economy in world ranking 2024
- "Jaipur is capital of Rajasthan" → capital of Rajasthan India
- "Pakistan happiest country" → happiest countries world ranking Pakistan`
        },
        { role: "user", content: combinedText.slice(0, 400) }
      ],
      temperature: 0.1,
      max_tokens: 20
    });
    searchQuery = qRes.choices[0].message.content.trim().replace(/["'.!?]/g, "");
    console.log("🔍 Search query:", searchQuery);
  } catch (e) { console.log("🔍 Using raw text as query"); }

  /* -------- STEP 2: SEARCH GOOGLE -------- */
  const searchResults = await googleSearch(searchQuery);

  /* -------- STEP 3: LLM FACT-CHECKS WITH SEARCH RESULTS -------- */
  let factCheckVerdict = "UNVERIFIED";
  let factCheckReason  = "";
  let aiResult         = null;

  // Language instruction for the LLM
  const langInstruction = isEnglish
    ? `Write the "explanation" and "factCheckReason" fields in English.`
    : `IMPORTANT: Write the "explanation" and "factCheckReason" fields in ${detectedLang.name} (${detectedLang.code}). The user's input is in ${detectedLang.name}, so your explanation must also be in ${detectedLang.name}. Do NOT write the explanation in English.`;

  try {
    const imageContext = imageInput ? `
IMAGE ANALYSIS:
- Description: ${imageDescription}
- Suspicious visual elements: ${suspiciousElements}
- Text extracted from image: ${extractedImageText || "(no text found)"}
` : "";

    const prompt = searchResults
      ? `You are a strict fact-checker. You have real Google search results below.

YOUR ONLY JOB: Read the search results and decide if the claim is TRUE or FALSE.

RULES:
- Read the search results carefully
- If results show the claim is WRONG → verdict: FAKE
- If results CONFIRM the claim → verdict: REAL
- If results show partial truth → verdict: MISLEADING
- If results don't address the claim → verdict: UNVERIFIED
- If the image shows suspicious visual manipulation, factor that in
- DO NOT use your own knowledge to override what the search results say

${langInstruction}

Return ONLY this JSON (no markdown, no extra text):
{
  "manipulationScore": number (0-95),
  "viralityRisk": "LOW" | "MEDIUM" | "HIGH",
  "techniques": [],
  "highlightedPhrases": [],
  "factCheckVerdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED",
  "factCheckReason": "one sentence in ${detectedLang.name}",
  "explanation": "2-3 sentences in ${detectedLang.name}: what Google found + is this claim true or false",
  "techniqueIntensity": { "fear": 0.0, "urgency": 0.0, "polarization": 0.0, "authority": 0.0, "emotion": 0.0 }
}

Score guide:
- REAL claim, no manipulation → 0-15
- REAL but sensational → 15-30
- UNVERIFIED → 30-50
- MISLEADING → 50-70
- FAKE → 70-95
${imageContext}
CLAIM: "${combinedText.slice(0, 500)}"

GOOGLE SEARCH RESULTS:
${searchResults}

Now read the results above and give your verdict. Remember: explanation must be in ${detectedLang.name}.`

      : `You are a strict fact-checker with no search results available.
Use your training knowledge. Be strict — wrong factual claims = FAKE.
${imageContext}
${langInstruction}

Return ONLY this JSON:
{
  "manipulationScore": number,
  "viralityRisk": "LOW" | "MEDIUM" | "HIGH",
  "techniques": [],
  "highlightedPhrases": [],
  "factCheckVerdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED",
  "factCheckReason": "one sentence in ${detectedLang.name}",
  "explanation": "2-3 sentences in ${detectedLang.name}",
  "techniqueIntensity": { "fear": 0.0, "urgency": 0.0, "polarization": 0.0, "authority": 0.0, "emotion": 0.0 }
}

CLAIM: "${combinedText.slice(0, 500)}"

Remember: explanation must be in ${detectedLang.name}.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 800
    });

    let raw = completion.choices[0].message.content || "";
    console.log("\n==== LLM RESPONSE ====\n" + raw.slice(0, 500) + "\n======================\n");

    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
    if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1);

    aiResult = JSON.parse(raw);
    factCheckVerdict = aiResult.factCheckVerdict || "UNVERIFIED";
    factCheckReason  = aiResult.factCheckReason  || "";
    console.log(`✅ Verdict: ${factCheckVerdict} | Score: ${aiResult.manipulationScore} | Lang: ${detectedLang.name}`);
  } catch (err) { console.error("AI error:", err.message); }

  /* -------- MERGE -------- */
  if (aiResult) {
    manipulationScore  = Math.max(manipulationScore, aiResult.manipulationScore || 0);
    techniques         = [...new Set([...techniques,         ...(aiResult.techniques         || [])])];
    highlightedPhrases = [...new Set([...highlightedPhrases, ...(aiResult.highlightedPhrases || [])])];
    Object.keys(techniqueIntensity).forEach(k => {
      techniqueIntensity[k] = Math.max(techniqueIntensity[k], aiResult.techniqueIntensity?.[k] || 0);
    });
  }

  /* -------- FORCE SCORE TO MATCH VERDICT -------- */
  if (factCheckVerdict === "FAKE"       && manipulationScore < 72) manipulationScore = 72;
  if (factCheckVerdict === "MISLEADING" && manipulationScore < 50) manipulationScore = 50;
  if (factCheckVerdict === "REAL"       && manipulationScore > 20) manipulationScore = Math.min(manipulationScore, 20);
  if (manipulationScore > 95) manipulationScore = 95;

  /* -------- VIRALITY -------- */
  let viralityRisk = "LOW";
  if (manipulationScore >= 60) viralityRisk = "HIGH";
  else if (manipulationScore >= 30) viralityRisk = "MEDIUM";

  /* -------- EXPLANATION -------- */
  // Build clean explanation without English "[Image: ...]" prefix
  let explanation = aiResult?.explanation || "";

  // Append image description in the detected language if image was used
  if (imageInput && imageDescription && !isEnglish) {
    // Let the LLM explanation stand on its own — it's already in the right language
    // Just append the fact-check verdict note if not already present
    if (factCheckReason && !explanation.includes(factCheckReason)) {
      explanation += ` ${factCheckReason}`;
    }
  } else if (imageInput && imageDescription && isEnglish) {
    if (factCheckReason && !explanation.includes(factCheckReason)) {
      explanation += ` Fact-check: ${factCheckVerdict} — ${factCheckReason}`;
    }
  } else {
    if (factCheckReason) explanation += ` Fact-check: ${factCheckVerdict} — ${factCheckReason}`;
  }

  if (!explanation) explanation = factCheckVerdict === "FAKE"
    ? (isEnglish ? "This claim appears to be false based on available information." : `यह दावा झूठा प्रतीत होता है।`)
    : `Fact-check: ${factCheckVerdict}.`;

  /* -------- RADAR -------- */
  Object.keys(techniqueIntensity).forEach(k => {
    techniqueIntensity[k] = Math.round(techniqueIntensity[k] * 100);
  });

  return {
    manipulationScore,
    viralityRisk,
    techniques,
    highlightedPhrases,
    explanation,
    factCheckVerdict,
    factCheckReason,
    techniqueIntensity,
    extractedImageText: extractedImageText || null,
    detectedLanguage: detectedLang.name
  };
}