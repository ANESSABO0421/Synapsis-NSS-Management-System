import MentorshipMessage from "../models/MentorshipMessage.js";

// ===========================
// GET ALL MESSAGES BY MENTORSHIP ID
// ===========================
export const getMessages = async (req, res) => {
  try {
    const { mentorshipId } = req.params;

    const messages = await MentorshipMessage.find({
      mentorship: mentorshipId,
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// SAVE NEW MESSAGE
// ===========================
export const sendMessage = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { message } = req.body;

    const senderId = req.user.id;
    const senderRole = req.user.role; // student or alumni

    if (!message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const newMessage = await MentorshipMessage.create({
      mentorship: mentorshipId,
      senderId,
      senderRole,
      message,
    });

    return res.json({
      success: true,
      newMessage,
    });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
