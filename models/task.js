const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type : String

    },
    status: {
        type: String,
        enum: ['To-do', 'in-progress', 'done'],
        default: 'To-do'
    },
    assignedTo: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dueDate: {
        type: Date
    }
}, { timestamps: true});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;