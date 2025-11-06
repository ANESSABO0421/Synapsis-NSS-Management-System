import Message from "../models/Message.js";

export const getMessagesForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const messages = await Message.find({ eventId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
    return res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
