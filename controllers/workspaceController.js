const Task = require('../models/task');
const Project = require('../models/Project');

// CREATE TASK IN WORKSPACE
const createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, assignedTo } = req.body;

    const project = await Project.findById(projectId);
    if (!project || !project.teamMembers.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Access denied. You are not a team member of this workspace.' });
    }

    const newTask = new Task({
      project: projectId,
      title,
      description,
      status: status || 'To Do',
      assignedTo
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE TASK STATUS (DRAG & DROP COLUMNS)
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project.teamMembers.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: 'Task column updated successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTask, updateTaskStatus };