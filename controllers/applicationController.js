const Application = require('../models/Application');
const Project = require('../models/Project');

// APPLY TO A PROJECT TEAM
const applyToProject = async (req, res) => {
  try {
    const { projectId, coverNote } = req.body;

    const existingApp = await Application.findOne({ project: projectId, applicant: req.user.userId });
    if (existingApp) return res.status(400).json({ message: 'You have already applied to this project' });

    const newApplication = new Application({
      project: projectId,
      applicant: req.user.userId,
      coverNote
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REVIEW APPLICATION (ACCEPT/REJECT)
const reviewApplication = async (req, res) => {
  try {
    const { applicationId, status } = req.body; // status: 'accepted' or 'rejected'
    
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const project = await Project.findById(application.project);
    if (project.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the project creator can review applications' });
    }

    application.status = status;
    await application.save();

    if (status === 'accepted') {
      if (!project.teamMembers.includes(application.applicant)) {
        project.teamMembers.push(application.applicant);
        await project.save();
      }
    }

    res.status(200).json({ message: `Application status updated to ${status}`, application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { applyToProject, reviewApplication };