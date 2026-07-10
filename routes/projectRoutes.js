const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');

router.post('/create', restrictToLoggedInUserOnly, async (req, res) => {
    try {
      const { title, description, requiredTechStack, timeline } = req.body;
  
      // req.user.userId comes directly from your auth.js middleware token verification
      const newProject = new Project({
        title,
        description,
        creator: req.user.userId,
        requiredTechStack: requiredTechStack || [],
        timeline,
        teamMembers: [req.user.userId] // The creator is automatically the first team member
      });
  
      await newProject.save();
      res.status(201).json({ message: 'Project idea posted successfully!', project: newProject });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // 2. GET ALL PROJECTS (Public: Anyone can browse project ideas)
  router.get('/', async (req, res) => {
    try {
      // .populate('creator', 'name email role') fetches the creator's details instead of just showing an ID string
      const projects = await Project.find().populate('creator', 'name email role');
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;