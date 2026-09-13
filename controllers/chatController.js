const Message = require('../models/Message');
const Project = require('../models/Project');

const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify user belongs to the project team
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.creator.toString() === req.user.userId ||
      project.teamMembers.some((memberId) => memberId.toString() === req.user.userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied: not a team member' });
    }

    const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProjectMessages };