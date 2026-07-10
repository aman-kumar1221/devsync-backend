const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Fixed: Capitalized T
const Project = require('../models/Project'); // Fixed: Capitalized P
const { restrictToLoggedInUserOnly } = require('../middlewares/auth'); // Fixed: Correct path to middleware folder

// 1. CREATE A TASK CARD (Protected)
router.post('/:projectId/tasks', restrictToLoggedInUserOnly, async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate } = req.body;
        const projectId = req.params.projectId;
        
        // Fixed: Added the missing database query line!
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: 'project not found' });
        }
        
        if (!project.teamMembers.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Access Denied: You are not a member of this project team' });
        }
      
        const newTask = new Task({
            project: projectId,
            title,
            description,
            assignedTo: assignedTo || null,
            dueDate
        });
      
        await newTask.save();
        res.status(201).json({ message: 'Task added to Kanban board!', task: newTask });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
      
// 2. MOVE A TASK (Update status column from 'To Do' -> 'In Progress' -> 'Done')
router.patch('/:projectId/tasks/:taskId', restrictToLoggedInUserOnly, async (req, res) => {
    try {
        const { status } = req.body; // Expects 'To Do', 'In Progress', or 'Done'
        const { projectId, taskId } = req.params;
      
        if (!['To Do', 'In Progress', 'Done'].includes(status)) {
            return res.status(400).json({ message: 'Invalid column placement' });
        }
      
        // Verify workspace membership first
        const project = await Project.findById(projectId);
        if (!project || !project.teamMembers.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Access Denied to this workspace' });
        }
      
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, project: projectId },
            { status },
            { new: true }
        );
      
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found in this project' });
        }
      
        res.status(200).json({ message: 'Kanban board updated successfully', task: updatedTask });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
      
module.exports = router;