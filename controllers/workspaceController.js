const Task = require('../models/task');
const Project = require('../models/Project');

// GET ALL TASKS FOR A PROJECT (KANBAN BOARD)
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isCreator = project.creator.toString() === req.user.userId;
    const isMember = project.teamMembers.map((id) => id.toString()).includes(req.user.userId);

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE TASK IN WORKSPACE
const createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, assignedTo } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isCreator = project.creator.toString() === req.user.userId;
    const isMember = project.teamMembers.map((id) => id.toString()).includes(req.user.userId);

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a team member of this workspace.' });
    }

    const newTask = new Task({
      project: projectId,
      title,
      description,
      status: status || 'To-do', // Fixed default to match enum
      assignedTo,
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
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isCreator = project.creator.toString() === req.user.userId;
    const isMember = project.teamMembers.map((id) => id.toString()).includes(req.user.userId);

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: 'Task column updated successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTask, updateTaskStatus, getProjectTasks };