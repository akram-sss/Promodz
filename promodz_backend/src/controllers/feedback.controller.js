import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * ANY authenticated user can send feedback
 */
export const sendFeedback = async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length < 3) {
    return res.status(400).json({ error: "Feedback message is required" });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        message,
        userId: req.user?.id || null,
      },
    });

    res.status(201).json({
      message: "Feedback sent successfully",
      feedback,
    });
  } catch (error) {
    console.error("Send feedback error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUBLIC — anyone (guest or logged-in) can send a contact message
 */
export const sendContactMessage = async (req, res) => {
  const { fullName, email, role, message } = req.body;

  if (!fullName || fullName.trim().length < 2) {
    return res.status(400).json({ error: "Full name is required (min 2 characters)." });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!message || message.trim().length < 3) {
    return res.status(400).json({ error: "Message is required (min 3 characters)." });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        senderRole: role === "company" ? "company" : "user",
        message: message.trim(),
        type: "contact",
      },
    });

    res.status(201).json({
      message: "Your message has been sent successfully!",
      feedback,
    });
  } catch (error) {
    console.error("Send contact message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ONLY super admin can view feedbacks
 */
export const getAllFeedbacks = async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
    });

    res.json({
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error("Get feedbacks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ONLY super admin can delete feedback
 */
export const deleteFeedback = async (req, res) => {
  const { feedbackId } = req.params;

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    await prisma.feedback.delete({
      where: { id: feedbackId },
    });

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
