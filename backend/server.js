import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import analyzeText from "./civisAnalyzer.js";

dotenv.config();

const app = express();

app.use(cors());

// Use body-parser explicitly — express's built-in json() ignores limit on some versions
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ limit: "25mb", extended: true }));

/* Test Route */
app.get("/", (req, res) => {
  res.send("CIVIS AI backend running 🚀");
});

/* Analyze Route */
app.post("/analyze", async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ error: "Text or image required" });
    }

    if (image && (!image.base64 || !image.mimeType)) {
      return res.status(400).json({ error: "Invalid image payload: base64 and mimeType required" });
    }

    const result = await analyzeText(text || "", image || null);
    res.json(result);

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      manipulationScore: 0,
      viralityRisk: "LOW",
      techniques: [],
      highlightedPhrases: [],
      explanation: "Server error occurred",
      factCheckVerdict: "UNVERIFIED",
      factCheckReason: "",
      techniqueIntensity: { fear: 0, urgency: 0, polarization: 0, authority: 0, emotion: 0 },
      extractedImageText: null
    });
  }
});

/* START SERVER */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CIVIS AI backend running on http://localhost:${PORT} 🚀`);
});