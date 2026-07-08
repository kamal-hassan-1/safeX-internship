import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  CheckSquare, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Info, 
  RefreshCw, 
  AlertCircle,
  Database,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates', 'groups', 'tasks', 'database'

  // Data States
  const [candidates, setCandidates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Filter States
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('');
  const [candidateRoleFilter, setCandidateRoleFilter] = useState('');
  
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [taskStatusFilter, setTaskStatusFilter] = useState('');

  // Modal States
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Form States
  const [candidateForm, setCandidateForm] = useState({
    name: '', email: '', phone: '', role: '', status: 'Applied', group: '', notes: ''
  });
  const [groupForm, setGroupForm] = useState({
    name: '', leadName: '', description: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', weekNumber: 1, assignedTo: '', status: 'Pending', dueDate: '', feedback: ''
  });

  // Logo fallback handler
  const [logoLoaded, setLogoLoaded] = useState(true);

  // Fetch Data
  useEffect(() => {
    fetchCandidates();
    fetchGroups();
    fetchTasks();
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/candidates`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      addToast('Failed to fetch candidates from server. Using local memory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/groups`);
      const data = await res.json();
      if (data.success) {
        setGroups(data.data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // Seed DB Function
  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Database successfully seeded with beautiful mock data!');
        fetchCandidates();
        fetchGroups();
        fetchTasks();
        setActiveTab('candidates');
      } else {
        addToast('Failed to seed database: ' + data.message, 'error');
      }
    } catch (err) {
      addToast('Error seeding database. Make sure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Candidate Actions
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingCandidate;
    const url = isEdit 
      ? `${API_BASE_URL}/candidates/${editingCandidate._id}` 
      : `${API_BASE_URL}/candidates`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const cleanedForm = { ...candidateForm };
      if (!cleanedForm.group) delete cleanedForm.group; // Remove empty string so backend doesn't fail ID validation

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Candidate ${isEdit ? 'updated' : 'added'} successfully!`);
        setCandidateModalOpen(false);
        setEditingCandidate(null);
        fetchCandidates();
        fetchGroups(); // Groups candidate counts change
      } else {
        addToast(data.message || 'Error occurred', 'error');
      }
    } catch (err) {
      addToast('Connection failed. Candidate could not be saved.', 'error');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/candidates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Candidate deleted successfully');
        fetchCandidates();
        fetchGroups();
        fetchTasks();
      }
    } catch (err) {
      addToast('Failed to delete candidate', 'error');
    }
  };

  const openCandidateModal = (cand = null) => {
    if (cand) {
      setEditingCandidate(cand);
      setCandidateForm({
        name: cand.name || '',
        email: cand.email || '',
        phone: cand.phone || '',
        role: cand.role || '',
        status: cand.status || 'Applied',
        group: cand.group?._id || cand.group || '',
        notes: cand.notes || ''
      });
    } else {
      setEditingCandidate(null);
      setCandidateForm({
        name: '', email: '', phone: '', role: '', status: 'Applied', group: '', notes: ''
      });
    }
    setCandidateModalOpen(true);
  };

  // Group Actions
  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingGroup;
    const url = isEdit 
      ? `${API_BASE_URL}/groups/${editingGroup._id}` 
      : `${API_BASE_URL}/groups`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Group ${isEdit ? 'updated' : 'added'} successfully!`);
        setGroupModalOpen(false);
        setEditingGroup(null);
        fetchGroups();
        fetchCandidates(); // candidates populate updated groups
      } else {
        addToast(data.message || 'Error occurred', 'error');
      }
    } catch (err) {
      addToast('Connection failed. Group could not be saved.', 'error');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group? Candidates will be unassigned.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/groups/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Group deleted successfully');
        fetchGroups();
        fetchCandidates();
      }
    } catch (err) {
      addToast('Failed to delete group', 'error');
    }
  };

  const openGroupModal = (grp = null) => {
    if (grp) {
      setEditingGroup(grp);
      setGroupForm({
        name: grp.name || '',
        leadName: grp.leadName || '',
        description: grp.description || ''
      });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: '', leadName: '', description: '' });
    }
    setGroupModalOpen(true);
  };

  // Task Actions
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingTask;
    const url = isEdit 
      ? `${API_BASE_URL}/tasks/${editingTask._id}` 
      : `${API_BASE_URL}/tasks`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Task ${isEdit ? 'updated' : 'assigned'} successfully!`);
        setTaskModalOpen(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        addToast(data.message || 'Error occurred', 'error');
      }
    } catch (err) {
      addToast('Connection failed. Task could not be saved.', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Task deleted successfully');
        fetchTasks();
      }
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title || '',
        description: task.description || '',
        weekNumber: task.weekNumber || 1,
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        status: task.status || 'Pending',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        feedback: task.feedback || ''
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '', description: '', weekNumber: selectedWeek, assignedTo: '', status: 'Pending', dueDate: '', feedback: ''
      });
    }
    setTaskModalOpen(true);
  };

  const updateTaskStatus = async (task, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Task status updated to ${newStatus}`);
        fetchTasks();
      }
    } catch (err) {
      addToast('Failed to update task status', 'error');
    }
  };

  // Helper getters/filters
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name?.toLowerCase().includes(candidateSearch.toLowerCase()) || 
                          cand.email?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                          cand.role?.toLowerCase().includes(candidateSearch.toLowerCase());
    const matchesStatus = candidateStatusFilter ? cand.status === candidateStatusFilter : true;
    const matchesRole = candidateRoleFilter ? cand.role === candidateRoleFilter : true;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const filteredTasks = tasks.filter(task => {
    const matchesWeek = task.weekNumber === selectedWeek;
    const matchesStatus = taskStatusFilter ? task.status === taskStatusFilter : true;
    return matchesWeek && matchesStatus;
  });

  // Get Initials for avatars
  const getInitials = (name) => {
    if (!name) return 'IN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            {logoLoaded ? (
              <img 
                src="/src/assets/logo.avif" 
                alt="SafeX Logo" 
                className="sidebar-logo"
                onError={() => setLogoLoaded(false)}
              />
            ) : (
              <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#2563eb' }}>
                SX
              </div>
            )}
            <span className="sidebar-brand-name">SafeX Portal</span>
          </div>

          <nav className="sidebar-menu">
            <div 
              className={`sidebar-item ${activeTab === 'candidates' ? 'active' : ''}`}
              onClick={() => setActiveTab('candidates')}
            >
              <Users size={18} />
              Candidates Directory
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveTab('groups')}
            >
              <Layers size={18} />
              Groups & Leaders
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <CheckSquare size={18} />
              Weekly Tasks
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div 
            className={`sidebar-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
            style={{ marginBottom: '1rem' }}
          >
            <Database size={18} />
            System Seed Setup
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>SafeX Intern Management © 2026</p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        
        {/* TAB 1: CANDIDATES */}
        {activeTab === 'candidates' && (
          <div>
            <header className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Candidates Directory</h1>
                <p>Manage, track, and assign incoming candidate profiles</p>
              </div>
              <button className="btn btn-primary" onClick={() => openCandidateModal()}>
                <Plus size={16} /> Add Candidate
              </button>
            </header>

            <div className="directory-controls card" style={{ marginBottom: '1.5rem' }}>
              <div className="search-box">
                <Search className="search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search name, email, role..." 
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select 
                  className="filter-select"
                  value={candidateStatusFilter}
                  onChange={(e) => setCandidateStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select 
                  className="filter-select"
                  value={candidateRoleFilter}
                  onChange={(e) => setCandidateRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="Frontend Dev">Frontend Dev</option>
                  <option value="Backend Dev">Backend Dev</option>
                  <option value="Fullstack Dev">Fullstack Dev</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="DevOps Intern">DevOps Intern</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <RefreshCw className="animate-spin" style={{ margin: '0 auto', color: '#2563eb' }} size={32} />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Syncing with backend...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <Info size={40} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
                <h3>No candidates found</h3>
                <p>Try clearing filters or add a new candidate to populate the dashboard.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="candidate-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Assigned Cohort</th>
                      <th>Applied Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map(cand => (
                      <tr key={cand._id}>
                        <td>
                          <div className="candidate-avatar-info">
                            <div className="candidate-avatar">
                              {getInitials(cand.name)}
                            </div>
                            <div>
                              <div className="candidate-meta-name">{cand.name}</div>
                              <div className="candidate-meta-email">{cand.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{cand.role}</td>
                        <td>
                          <span className="badge" style={{ 
                            backgroundColor: `var(--status-${cand.status?.toLowerCase()}-bg)`, 
                            color: `var(--status-${cand.status?.toLowerCase()}-text)` 
                          }}>
                            {cand.status}
                          </span>
                        </td>
                        <td>
                          {cand.group?.name ? (
                            <span style={{ fontWeight: 500, color: '#2563eb' }}>{cand.group.name}</span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                        <td>{cand.joinDate ? new Date(cand.joinDate).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="icon-btn" title="Edit Candidate" onClick={() => openCandidateModal(cand)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn icon-btn-danger" title="Delete Candidate" onClick={() => handleDeleteCandidate(cand._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GROUPS & LEADERS */}
        {activeTab === 'groups' && (
          <div>
            <header className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Groups & Cohorts</h1>
                <p>Organize candidates into active development groups and assign mentors</p>
              </div>
              <button className="btn btn-primary" onClick={() => openGroupModal()}>
                <Plus size={16} /> Create Group
              </button>
            </header>

            {groups.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <Layers size={40} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
                <h3>No groups created yet</h3>
                <p>Create a group to group candidates together and assign supervisors.</p>
              </div>
            ) : (
              <div className="groups-grid">
                {groups.map(grp => (
                  <div className="card group-card" key={grp._id}>
                    <div>
                      <div className="group-card-header">
                        <div className="group-title">
                          <h3>{grp.name}</h3>
                          <div className="group-lead">Lead: {grp.leadName}</div>
                        </div>
                        <div className="action-buttons">
                          <button className="icon-btn" title="Edit Group" onClick={() => openGroupModal(grp)}>
                            <Edit2 size={15} />
                          </button>
                          <button className="icon-btn icon-btn-danger" title="Delete Group" onClick={() => handleDeleteGroup(grp._id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <p className="group-desc">{grp.description || 'No description provided.'}</p>
                    </div>

                    <div className="group-members">
                      <div className="group-members-title">Active Interns ({grp.candidates?.length || 0})</div>
                      <div className="group-members-list">
                        {grp.candidates && grp.candidates.length > 0 ? (
                          grp.candidates.map(member => (
                            <div className="member-item" key={member._id}>
                              <div className="member-info">
                                <div className="member-dot"></div>
                                <span style={{ fontWeight: 500 }}>{member.name}</span>
                              </div>
                              <span className="member-role">{member.role}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.25rem 0' }}>
                            No candidates assigned to this group yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEEKLY TASKS TRACKER */}
        {activeTab === 'tasks' && (
          <div>
            <header className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Weekly-Task Tracker</h1>
                <p>Assign tasks, set due dates, and monitor candidate completions by week</p>
              </div>
              <button className="btn btn-primary" onClick={() => openTaskModal()}>
                <Plus size={16} /> Assign Task
              </button>
            </header>

            {/* Weeks Navigation */}
            <div className="weeks-nav">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                <div 
                  key={w} 
                  className={`week-tab ${selectedWeek === w ? 'active' : ''}`}
                  onClick={() => setSelectedWeek(w)}
                >
                  Week {w}
                </div>
              ))}
            </div>

            <div className="directory-controls card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Week {selectedWeek} Deliverables</h3>
              
              <select 
                className="filter-select"
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
              >
                <option value="">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <CheckSquare size={40} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
                <h3>No tasks assigned for Week {selectedWeek}</h3>
                <p>Assign a task to interns for this week to track their progress.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredTasks.map(task => (
                  <div className="card task-card" key={task._id}>
                    <div>
                      <div className="task-header">
                        <div className="task-title">{task.title}</div>
                        <div className="action-buttons">
                          <button className="icon-btn" title="Edit Task" onClick={() => openTaskModal(task)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="icon-btn icon-btn-danger" title="Delete Task" onClick={() => handleDeleteTask(task._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="task-desc">{task.description || 'No description provided.'}</p>
                    </div>

                    <div className="task-footer">
                      <div className="task-meta">
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Assignee: </span>
                          <span className="task-assignee">{task.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                        <span className="badge" style={{
                          backgroundColor: `var(--task-${task.status?.toLowerCase().replace(' ', '')}-bg)`,
                          color: `var(--task-${task.status?.toLowerCase().replace(' ', '')}-text)`
                        }}>
                          {task.status}
                        </span>
                      </div>

                      <div className="task-meta" style={{ marginTop: '0.25rem' }}>
                        <span className="task-due">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                        
                        <select 
                          className="filter-select" 
                          style={{ minWidth: '120px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>

                      {task.feedback && (
                        <div className="task-feedback">
                          <strong>Feedback:</strong> {task.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DATABASE SETUP & SEEDING */}
        {activeTab === 'database' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="card seed-card">
              <Database size={48} style={{ color: '#2563eb' }} />
              <h2 className="seed-title">Interactive Database Seed Setup</h2>
              <p className="seed-desc">
                Populate your MongoDB database with pre-configured mock data representing real-life SafeX candidates, 
                development cohorts, and structured week 1 & 2 tasks. This enables immediate testing of the frontend interface.
              </p>
              <div style={{ color: '#dc2626', fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} /> Note: This action cleans all existing database records before seeding!
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleSeedDatabase} 
                disabled={loading}
                style={{ marginTop: '1rem', width: '200px' }}
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Seed Database Now'}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: ADD/EDIT CANDIDATE */}
      {candidateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCandidate ? 'Edit Candidate Details' : 'Add Candidate Profile'}</h2>
              <button className="icon-btn" onClick={() => setCandidateModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCandidateSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({...candidateForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({...candidateForm, phone: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    className="form-control"
                    required
                    value={candidateForm.role}
                    onChange={(e) => setCandidateForm({...candidateForm, role: e.target.value})}
                  >
                    <option value="">Select Role</option>
                    <option value="Frontend Dev">Frontend Dev</option>
                    <option value="Backend Dev">Backend Dev</option>
                    <option value="Fullstack Dev">Fullstack Dev</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="DevOps Intern">DevOps Intern</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Application Status</label>
                  <select 
                    className="form-control"
                    value={candidateForm.status}
                    onChange={(e) => setCandidateForm({...candidateForm, status: e.target.value})}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Assign to Group</label>
                <select 
                  className="form-control"
                  value={candidateForm.group}
                  onChange={(e) => setCandidateForm({...candidateForm, group: e.target.value})}
                >
                  <option value="">No Cohort Assigned</option>
                  {groups.map(grp => (
                    <option key={grp._id} value={grp._id}>{grp.name} (Lead: {grp.leadName})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Review / Notes</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={candidateForm.notes}
                  onChange={(e) => setCandidateForm({...candidateForm, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCandidateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT GROUP */}
      {groupModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingGroup ? 'Edit Group Settings' : 'Create Development Group'}</h2>
              <button className="icon-btn" onClick={() => setGroupModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleGroupSubmit}>
              <div className="form-group">
                <label>Group Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  placeholder="e.g. Engineering Alpha"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Team Lead / Mentor Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={groupForm.leadName}
                  onChange={(e) => setGroupForm({...groupForm, leadName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Focus areas, goals, and technical stack details."
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setGroupModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN/EDIT WEEKLY TASK */}
      {taskModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Modify Task Assignment' : 'Assign Intern Task'}</h2>
              <button className="icon-btn" onClick={() => setTaskModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  placeholder="e.g. Design Dashboard Mockups"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Task Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Describe standard requirements and deliverables."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Target Week</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    min="1" 
                    max="8"
                    value={taskForm.weekNumber}
                    onChange={(e) => setTaskForm({...taskForm, weekNumber: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Assign to Intern</label>
                  <select 
                    className="form-control"
                    required
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                  >
                    <option value="">Select Candidate</option>
                    {candidates.map(cand => (
                      <option key={cand._id} value={cand._id}>{cand.name} ({cand.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Current Status</label>
                  <select 
                    className="form-control"
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Review / Feedback</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  placeholder="Add evaluation feedback when task is completed."
                  value={taskForm.feedback}
                  onChange={(e) => setTaskForm({...taskForm, feedback: e.target.value})}
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setTaskModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
