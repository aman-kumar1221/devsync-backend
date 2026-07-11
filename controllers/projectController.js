const Project = require('../models/Project');

// ==========================================
// 1. CREATE A NEW PROJECT
// ==========================================
const createProject = async (req, res) => {
  try {
    const { title, description, requiredTechStack, timeline } = req.body;

    const newProject = new Project({
      title,
      description,
      creator: req.user.userId,
      requiredTechStack: requiredTechStack || [],
      timeline,
      teamMembers: [req.user.userId]
    });

    await newProject.save();
    res.status(201).json({ message: 'Project idea posted successfully!', project: newProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2. GET ALL PROJECTS (MAIN FEED)
// ==========================================
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('creator', 'name email role')
      .populate('comments.user', 'name role');
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. TOGGLE LIKE / UNLIKE
// ==========================================
const toggleLikeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project post not found' });
    }

    const hasLiked = project.likes.includes(req.user.userId);

    if (hasLiked) {
      // Unlike: Remove user ID from array
      project.likes = project.likes.filter(id => id.toString() !== req.user.userId);
      await project.save();
      return res.status(200).json({ message: 'Post unliked', likesCount: project.likes.length });
    } else {
      // Like: Add user ID to array
      project.likes.push(req.user.userId);
      await project.save();
      return res.status(200).json({ message: 'Post liked!', likesCount: project.likes.length });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 4. ADD A COMMENT
// ==========================================
const addCommentToProject = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project post not found' });
    }

    project.comments.push({ user: req.user.userId, text });
    await project.save();

    res.status(201).json({ message: 'Comment added successfully!', comments: project.comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  toggleLikeProject,
  addCommentToProject
};