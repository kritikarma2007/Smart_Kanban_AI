import express from 'express';
import Task from '../models/Task.js';
import { protect } from '../middleware/authMiddleware.js'; // Changed from '../authMiddleware.js'

const router = express.Router();

// @route   GET /api/tasks
// @desc    Fetch all tasks for the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
});

// @route   POST /api/tasks
// @desc    Create a new Kanban task
router.post('/', protect, async (req, res) => {
    try {
        // 📦 Destructure and validate incoming payload fields
        const { title, description, status, priority, dueDate } = req.body;
        
        // ✅ Validate required field: title
        if (!title || !title.trim()) {
            console.log("❌ Validation Error: Title is required but not provided");
            return res.status(400).json({ message: 'Title is required' });
        }

        // ✅ Validate status field - handle spaces and capital letters
        // Normalize status: 'To Do' → 'todo', 'In Progress' → 'inprogress'
        let normalizedStatus = status ? status.toLowerCase().replace(/\s+/g, '') : 'todo';
        const validStatuses = ['todo', 'inprogress', 'review', 'done'];
        
        if (!validStatuses.includes(normalizedStatus)) {
            console.log("❌ Validation Error: Invalid status provided:", status, "→ Normalized to:", normalizedStatus);
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        // ✅ Validate priority field - normalize to lowercase
        const normalizedPriority = priority 
            ? priority.toLowerCase() 
            : 'medium';
        
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(normalizedPriority)) {
            console.log("❌ Validation Error: Invalid priority provided:", priority);
            return res.status(400).json({ 
                message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
            });
        }

        // 🚀 Log the incoming payload for debugging
        console.log("🚀 Backend received task payload:", {
            title,
            description,
            status: normalizedStatus,
            priority: normalizedPriority,
            dueDate,
            user: req.user._id
        });

        // 💾 Create task object with sanitized fields
        const task = await Task.create({
            user: req.user._id,
            title: title.trim(),
            description: description ? description.trim() : '',
            status: normalizedStatus,
            priority: normalizedPriority,
            dueDate: dueDate || null
        });

        console.log("✅ Task created successfully in MongoDB:", task._id);
        res.status(201).json(task);

    } catch (error) {
        // ❌ Detailed error logging for debugging
        console.log("❌ MONGODB SAVE CRASH:", error.message);
        console.log("📋 Full error details:", error);
        
        // Send detailed error message back to frontend for debugging
        res.status(500).json({ 
            message: 'Error creating task: ' + error.message 
        });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task status field only
router.put('/:id', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const normalizedStatus = status ? status.toLowerCase().replace(/\s+/g, '') : null;
        const validStatuses = ['todo', 'inprogress', 'review', 'done'];

        if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
            console.log('❌ Invalid status update payload:', status);
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        task.status = normalizedStatus;
        await task.save();

        console.log('✅ Task status updated via DB:', task._id, normalizedStatus);
        return res.status(200).json(task);
    } catch (error) {
        console.log('❌ Error updating task status:', error.message);
        return res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Remove a task card from existence
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await task.deleteOne();
        console.log('✅ Task removed successfully from DB:', req.params.id);
        return res.status(200).json({ message: 'Task removed successfully' });
    } catch (error) {
        console.log('❌ Error deleting task:', error.message);
        return res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
});

export default router;