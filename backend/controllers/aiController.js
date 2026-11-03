import { HfInference } from "@huggingface/inference";
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
import { groq } from "../utils/ai.js";
import dotenv from "dotenv";
dotenv.config();





const MAX_PROMPT_CHARS = 4000;

export const generateAIInsight = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== "string" || !prompt.trim())
      return res.status(400).json({ success: false, message: "Prompt required" });
    if (prompt.length > MAX_PROMPT_CHARS)
      return res
        .status(400)
        .json({ success: false, message: `Prompt must be under ${MAX_PROMPT_CHARS} characters` });

    // Call Groq model
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Groq model
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that gives event and attendance insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({ success: true, insight: aiResponse });
  } catch (error) {
    if (error.status === 503) {
      return res.status(503).json({ success: false, message: "AI features are not configured" });
    }
    console.error("AI Insight Error:", error);
    res.status(502).json({ success: false, message: "AI generation failed" });
  }
};





export const generateEventSummary = async (req, res) => {
  try {
    const { title, description, location, hours, participants } = req.body;

    const input = `
      Event Title: ${title}
      Description: ${description}
      Location: ${location}
      Duration: ${hours} hours
      Participants: ${Array.isArray(participants) ? participants.slice(0, 200).join(", ") : ""}
      Generate a short, professional event summary for NSS.
    `;

    // ✅ Use the correct method for BART
    const result = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: input,
      parameters: { max_length: 200, min_length: 60 },
    });

    res.json({
      success: true,
      summary: result.summary_text || result[0]?.summary_text || "No summary generated",
    });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate summary",
    });
  }
};
