import TeamMember from "../models/TeamMember.js";

export const TeamMemberController = {
  list: async (req, res) => {
    try {
      const { role, domain } = req.query;
      const filter = {};
      if (role) filter.role = role;
      if (domain) filter.domain = domain;

      const members = await TeamMember.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, members });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const member = await TeamMember.findById(req.params.id);
      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }
      res.json({ success: true, member });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { name, image, domain, role, linkedin, github, instagram } = req.body;

      if (!name || !image || !domain || !role) {
        return res.status(400).json({ success: false, message: "Name, image, domain, and role are required" });
      }

      const member = new TeamMember({
        name,
        image,
        domain,
        role,
        linkedin: linkedin || "",
        github: github || "",
        instagram: instagram || "",
      });

      await member.save();
      res.status(201).json({ success: true, member });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { name, image, domain, role, linkedin, github, instagram } = req.body;
      const { id } = req.params;

      const member = await TeamMember.findById(id);
      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      if (name) member.name = name;
      if (image) member.image = image;
      if (domain) member.domain = domain;
      if (role) member.role = role;
      if (linkedin !== undefined) member.linkedin = linkedin;
      if (github !== undefined) member.github = github;
      if (instagram !== undefined) member.instagram = instagram;

      await member.save();
      res.json({ success: true, member });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const member = await TeamMember.findByIdAndDelete(id);
      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      res.json({ success: true, message: "Member deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};