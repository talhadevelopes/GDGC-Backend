import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    res.status(201).json({ success: true, msg: "Message sent successfully" });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};