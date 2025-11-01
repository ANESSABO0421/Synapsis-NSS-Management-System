import { HfInference } from "@huggingface/inference";
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

export const generateEventSummary = async (req, res) => {
  try {
    const { title, description, location, hours, participants } = req.body;

    const input = `
      Event Title: ${title}
      Description: ${description}
      Location: ${location}
      Duration: ${hours} hours
      Participants: ${participants.join(", ")}
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
