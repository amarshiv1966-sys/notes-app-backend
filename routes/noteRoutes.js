const express = require("express");
const Note = require("../models/Note");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// search MUST be above /:id or Express matches "search" as a MongoDB ObjectId
router.get("/search/:keyword", protect, async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const notes = await Note.find({
      user: req.user._id,
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { subject: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error searching notes" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newNote = await Note.create({
      user: req.user._id,
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim(),
    });

    res.status(201).json({ message: "Note created successfully", note: newNote });
  } catch (error) {
    res.status(500).json({ message: "Error creating note" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { title, subject, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this note" });
    }

    note.title = title?.trim() || note.title;
    note.subject = subject?.trim() || note.subject;
    note.content = content?.trim() || note.content;

    const updatedNote = await note.save();
    res.json({ message: "Note updated successfully", note: updatedNote });
  } catch (error) {
    res.status(500).json({ message: "Error updating note" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this note" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note" });
  }
});

module.exports = router;