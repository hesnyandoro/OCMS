import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, UserPlus, Trash2, Mail, Shield, MapPin, Search, Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const emptyForm = {
        username: '',
        email: '',
        name: '',
        assignedRegion: '',
        role: 'fieldagent'
    };
    const [formData, setFormData] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [resendingId, setResendingId] = useState(null);

    // Check if user is admin
    useEffect(() => {
        if (authState?.user?.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [authState, navigate]);

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = !roleFilter || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Full name is required';
        if (!formData.username.trim()) errors.username = 'Username is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (formData.role === 'fieldagent' && !formData.assignedRegion.trim()) {
            errors.assignedRegion = 'Region is required for field agents';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create field agent
    const handleCreateFieldAgent = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            const { data } = await api.post('/users/field-agent', formData);
            setShowCreateModal(false);
            setFormData(emptyForm);
            setFormErrors({});
            fetchUsers();
            if (data.emailSent) {
                toast.success(`Invite sent to ${formData.email}`);
            } else {
                toast.success(data.msg || 'User created. Invite was logged on the server.');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.msg || 'Failed to create user';
            setFormErrors({ submit: errorMsg });
            console.error('Error creating user:', error);
        }
    };

    const handleResendInvite = async (userId, email) => {
        setResendingId(userId);
        try {
            const { data } = await api.post(`/users/${userId}/resend-invite`);
            if (data.emailSent) {
                toast.success(`Invite resent to ${email}`);
            } else {
                toast.success(data.msg || 'Invite regenerated. Check the server log for the link.');
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to resend invite');
        } finally {
            setResendingId(null);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    // Stats
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const fieldAgentCount = users.filter(u => u.role === 'fieldagent').length;

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100 mb-2">User Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage system users and field agents</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-[#1B4332] dark:border-dark-green-primary">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</h3>
                        </div>
                        <div className="bg-[#1B4332] dark:bg-dark-green-primary p-3 rounded-lg">
                            <UsersIcon size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-[#D93025] dark:border-red-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Administrators</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{adminCount}</h3>
                        </div>
                        <div className="bg-[#D93025] dark:bg-red-600 p-3 rounded-lg">
                            <Shield size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-[#F59E0B] dark:border-dark-gold-primary">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Field Agents</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{fieldAgentCount}</h3>
                        </div>
                        <div className="bg-[#F59E0B] dark:bg-dark-gold-primary p-3 rounded-lg">
                            <UserPlus size={24} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Administrators</option>
                            <option value="fieldagent">Field Agents</option>
                        </select>
                    </div>
                </div>

                {/* Create Button */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#1B4332] dark:bg-dark-green-primary hover:bg-[#2D5F4D] dark:hover:bg-dark-green-hover text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        Invite User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-[#1B4332] dark:text-dark-green-primary" size={40} />
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-[#1B4332] dark:bg-dark-green-secondary text-white">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Username</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Region</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <tr key={user._id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors`}>
                                            <td className="py-4 px-6 text-gray-800 dark:text-gray-100 font-medium">{user.name || 'N/A'}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Mail size={16} className="text-gray-400 dark:text-dark-text-tertiary" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-700 dark:text-gray-100">{user.username}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.role === 'admin' 
                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                    <Shield size={14} />
                                                    {user.role === 'admin' ? 'Administrator' : 'Field Agent'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.assignedRegion ? (
                                                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-100">
                                                        <MapPin size={16} className="text-[#F59E0B] dark:text-dark-gold-primary" />
                                                        {user.assignedRegion}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-dark-text-muted italic">All Regions</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleResendInvite(user._id, user.email)}
                                                        disabled={resendingId === user._id}
                                                        className="text-[#1B4332] dark:text-dark-green-primary hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                                                        title="Resend invite"
                                                    >
                                                        {resendingId === user._id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                    </button>
                                                    {user._id !== authState?.user?.id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.username)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <UsersIcon size={48} className="text-gray-300 dark:text-dark-text-muted mb-3" />
                                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">No Users Found</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Field Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-[#1B4332] dark:text-dark-green-primary">Invite User</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                They will receive an email to set a password and sign in.
                            </p>
                        </div>

                        <form onSubmit={handleCreateFieldAgent} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="form-label">
                                    Full Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`form-control ${formErrors.name ? 'border-danger' : ''}`}
                                    placeholder="Enter full name"
                                />
                                {formErrors.name && (
                                    <p className="text-danger text-xs mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="form-label">
                                    Username <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`form-control ${formErrors.username ? 'border-danger' : ''}`}
                                    placeholder="Enter username"
                                />
                                {formErrors.username && (
                                    <p className="text-danger text-xs mt-1">{formErrors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="form-label">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`form-control ${formErrors.email ? 'border-danger' : ''}`}
                                    placeholder="Enter email"
                                />
                                {formErrors.email && (
                                    <p className="text-danger text-xs mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="form-label">
                                    Role <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="form-control"
                                >
                                    <option value="fieldagent">Field Agent</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            {formData.role === 'fieldagent' && (
                                <div>
                                    <label className="form-label">
                                        Assigned Region <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="assignedRegion"
                                        value={formData.assignedRegion}
                                        onChange={handleInputChange}
                                        className={`form-control ${formErrors.assignedRegion ? 'border-danger' : ''}`}
                                        placeholder="Enter assigned region (e.g., Kiambu, Nyeri)"
                                    />
                                    {formErrors.assignedRegion && (
                                        <p className="text-danger text-xs mt-1">{formErrors.assignedRegion}</p>
                                    )}
                                    <small className="text-muted">Enter the region this field agent will manage</small>
                                </div>
                            )}

                            {/* Submit Error */}
                            {formErrors.submit && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {formErrors.submit}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData(emptyForm);
                                        setFormErrors({});
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-400 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-500 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-[#1B4332] hover:bg-[#2D5F4D] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
