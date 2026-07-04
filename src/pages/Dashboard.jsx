import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Clock, Sparkles } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('smart_kanban_user') || 'Developer';
  const token = localStorage.getItem('token') || localStorage.getItem('smart_kanban_token');

  // Initialize with empty columns matching your framework structure
  const [boardData, setBoardData] = useState({
    todo: [],
    inprogress: [],
    review: [],
    done: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ];

  // Protect route and load database records on entry
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTasksFromDatabase();
  }, [token]);

  // 1. READ: Load entries from MongoDB and organize them into respective columns
  const fetchTasksFromDatabase = async () => {
    if (!token) {
      console.error('❌ No auth token found while fetching tasks.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payload = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to fetch tasks:', payload.message || response.statusText);
        return;
      }

      const structuredData = { todo: [], inprogress: [], review: [], done: [] };

      payload.forEach(task => {
        const normalizedStatus = task.status ? task.status.toLowerCase().replace(/\s+/g, '') : 'todo';
        const columnKey = ['todo', 'inprogress', 'review', 'done'].includes(normalizedStatus)
          ? normalizedStatus
          : 'todo';

        structuredData[columnKey].push({
          id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
          dueDate: task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
          assignee: username
        });
      });

      setBoardData(structuredData);
    } catch (error) {
      console.error('❌ Error fetching dashboard records:', error.response?.data || error.message || error);
    }
  };

  const handleOpenModal = (columnId) => {
    setActiveColumn(columnId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveColumn(null);
  };

  // 2. CREATE: Write new card objects to MongoDB backend
  const handleSaveTask = async (task) => {
    try {
      // 📦 Bundle task payload with correct state variables and status mapping
      const payload = {
        title: task.title,
        description: task.description || '',
        priority: task.priority ? task.priority.toLowerCase() : 'medium',
        status: activeColumn, // The active column id string ('todo', 'inprogress', etc)
        dueDate: task.dueDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      
      // 🚀 Log complete payload before sending to backend
      console.log("🚀 Payload being sent to backend:", payload);
      
      // ✅ Verify JWT token is available before making request
      if (!token) {
        console.error("❌ Authorization token missing! User may not be logged in.");
        return;
      }

      // 🔐 API request with robust error handling and authorization header
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const serverSavedTask = await response.json();

      if (response.ok) {
        // ✅ Task created successfully - map backend response to state format
        const formattedTask = {
          id: serverSavedTask._id,
          title: serverSavedTask.title,
          description: serverSavedTask.description,
          priority: serverSavedTask.priority.charAt(0).toUpperCase() + serverSavedTask.priority.slice(1),
          dueDate: new Date(serverSavedTask.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          assignee: username
        };

        console.log("✅ Task created successfully:", formattedTask);

        setBoardData((prev) => ({
          ...prev,
          [activeColumn]: [...prev[activeColumn], formattedTask]
        }));
      } else {
        // ❌ Backend returned an error response
        console.error("❌ Frontend API Error:", serverSavedTask.message || "Unknown error from server");
      }
    } catch (error) {
      // ❌ Network or parsing error during API call
      console.error("❌ Frontend API Error:", error.response?.data || error.message);
    }

    handleCloseModal();
  };

  // 3. UPDATE: Handle task drag-and-drop status changes and sync to backend
  const handleTaskDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const previousBoard = boardData;
    const sourceList = Array.from(boardData[source.droppableId]);
    const destinationList = source.droppableId === destination.droppableId
      ? sourceList
      : Array.from(boardData[destination.droppableId]);

    const [movedTask] = sourceList.splice(source.index, 1);
    destinationList.splice(destination.index, 0, movedTask);

    const nextBoardData = {
      ...boardData,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destinationList
    };

    setBoardData(nextBoardData);

    if (source.droppableId !== destination.droppableId) {
      if (!token) {
        console.error('❌ Authorization token missing for task update.');
        setBoardData(previousBoard);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/tasks/${movedTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: destination.droppableId })
        });

        const payload = await response.json();
        if (!response.ok) {
          console.error('❌ Task status update failed:', payload.message || response.statusText);
          setBoardData(previousBoard);
        }
      } catch (error) {
        console.error('❌ Task status update failed:', error.response?.data || error.message || error);
        setBoardData(previousBoard);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!token) {
      console.error('❌ Authorization token missing for delete request.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const payload = await response.json();
      if (!response.ok) {
        console.error('❌ Task deletion failed:', payload.message || response.statusText);
        return;
      }

      setBoardData((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([columnId, tasks]) => [
            columnId,
            tasks.filter((task) => task.id !== taskId)
          ])
        )
      );
      console.log('✅ Task deleted successfully:', taskId);
    } catch (error) {
      console.error('❌ Frontend delete API Error:', error.response?.data || error.message || error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_kanban_token');
    localStorage.removeItem('smart_kanban_user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Dynamic calculations for live stats
  const totalTasks = Object.values(boardData).reduce((sum, list) => sum + list.length, 0);
  const inProgressTasks = boardData.inprogress?.length || 0;
  const completedTasks = boardData.done?.length || 0;
  const reviewTasks = boardData.review?.length || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const stats = [
    { label: 'Total Tasks', value: totalTasks.toString(), icon: LayoutDashboard, color: 'text-purple-400' },
    { label: 'In Progress', value: inProgressTasks.toString(), icon: Clock, color: 'text-violet-400' },
    { label: 'Completed', value: completedTasks.toString(), icon: CheckSquare, color: 'text-indigo-400' },
    { label: 'AI Review Pending', value: reviewTasks.toString(), icon: Sparkles, color: 'text-fuchsia-400' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col justify-start"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Welcome Back, <span className="text-[#7c3aed]">{username}</span>
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Here is your productivity overview for today. Drag and drop cards to update status.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="glass-panel p-5 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all duration-300 group hover:-translate-y-1"
          >
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="mt-2 text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
            <div className="p-3 rounded-lg bg-white/5 group-hover:bg-[#7c3aed]/10 border border-white/5 group-hover:border-[#7c3aed]/20 transition-all">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Kanban Board Container */}
      <motion.div variants={itemVariants} className="flex-1">
        <KanbanBoard
          boardData={boardData}
          onDragEnd={handleTaskDragEnd}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleOpenModal}
        />
      </motion.div>

      {/* Backdrop-blurred Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveTask}
            columnName={columns.find((c) => c.id === activeColumn)?.title || ''}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}