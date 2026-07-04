import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        // Accepts both frontend UI strings and clean backend keys!
        enum: ['todo', 'inprogress', 'review', 'done', 'To Do', 'In Progress', 'Review', 'Done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'Low', 'Medium', 'High'],
        default: 'medium'
    },
    dueDate: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);