import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, columnName }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const handleAIAssist = async () => {
    if (!title.trim()) {
      setError('Please enter a task title before using AI assist.');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('smart_kanban_token');
    if (!token) {
      setError('Authentication token missing. Please login again.');
      return;
    }

    setIsAIGenerating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim() })
      });

      const payload = await response.json();
      if (!response.ok) {
        console.error('❌ AI Assist Error:', payload.message || response.statusText);
        setError(payload.message || 'AI assist failed.');
        return;
      }

      setDescription(payload.description || '');
      setSubtasks(Array.isArray(payload.subtasks) ? payload.subtasks : []);
    } catch (error) {
      console.error('❌ AI Assist API Error:', error);
      setError('AI assist failed. Please try again.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    // ✅ CRITICAL: Prevent default form submission and page reload
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    // 📦 Bundle all state variables into payload object
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      subtasks,
      priority,
      dueDate: dueDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      assignee: localStorage.getItem('smart_kanban_user') || 'AI Agent'
    };

    // 🚀 Log the complete payload before sending to parent component
    console.log("🚀 Payload being sent:", newTask);

    onSave(newTask);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.35 }}
        className="relative w-full max-w-md bg-[#0f0c22]/90 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(124,58,237,0.15)] overflow-hidden z-10"
      >
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#7c3aed]/15 blur-[40px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Add New Task</h3>
            <p className="text-xs text-gray-400 mt-0.5">Creating task in <span className="text-[#7c3aed] font-semibold">{columnName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Task Title
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Implement drag & drop API"
                className="flex-1 block w-full px-3 py-2 bg-black/45 border border-white/10 focus:border-[#7c3aed] focus:ring-[#7c3aed]/25 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-4 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={isAIGenerating}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-semibold hover:bg-[#7c3aed]/20 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {isAIGenerating ? 'Generating...' : '✨ AI Auto-Fill'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief task description..."
              rows={3}
              className="block w-full px-3 py-2 bg-black/45 border border-white/10 focus:border-[#7c3aed] focus:ring-[#7c3aed]/25 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-4 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="block w-full px-3 py-2 bg-black/45 border border-white/10 focus:border-[#7c3aed] focus:ring-[#7c3aed]/25 rounded-lg text-white text-sm focus:outline-none focus:ring-4 transition-all"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. Jun 20"
                className="block w-full px-3 py-2 bg-black/45 border border-white/10 focus:border-[#7c3aed] focus:ring-[#7c3aed]/25 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-4 transition-all"
              />
            </div>
          </div>

          {subtasks.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                AI-generated Subtasks
              </label>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-2">
                {subtasks.map((subtask, index) => (
                  <li key={`${subtask}-${index}`}>{subtask}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-white/10 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-[#7c3aed] hover:bg-[#8a2be2] shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] transition-all duration-300 glow-btn cursor-pointer"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
