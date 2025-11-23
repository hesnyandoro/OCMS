import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, UserPlus, Trash2, Mail, Shield, MapPin, Search, Loader2 } from 'lucide-react';
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
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        assignedRegion: ''
    });
    const [formErrors, setFormErrors] = useState({});

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
        if (!formData.username.trim()) errors.username = 'Username is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.password.trim()) errors.password = 'Password is required';
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.assignedRegion.trim()) errors.assignedRegion = 'Region is required';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create field agent
    const handleCreateFieldAgent = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            await api.post('/users/field-agent', formData);
            setShowCreateModal(false);
            setFormData({
                username: '',
                email: '',
                password: '',
                name: '',
                assignedRegion: ''
            });
            setFormErrors({});
            fetchUsers();
        } catch (error) {
            const errorMsg = error.response?.data?.msg || 'Failed to create field agent';
            setFormErrors({ submit: errorMsg });
            console.error('Error creating field agent:', error);
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
        <div className="p-4 md:p-8 bg-[#F3F4F6] min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1B4332] mb-2">User Management</h1>
                <p className="text-gray-600">Manage system users and field agents</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#1B4332]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-2">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-900">{totalUsers}</h3>
                        </div>
                        <div className="bg-[#1B4332] p-3 rounded-lg">
                            <UsersIcon size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#D93025]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-2">Administrators</p>
                            <h3 className="text-3xl font-bold text-gray-900">{adminCount}</h3>
                        </div>
                        <div className="bg-[#D93025] p-3 rounded-lg">
                            <Shield size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#F59E0B]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-2">Field Agents</p>
                            <h3 className="text-3xl font-bold text-gray-900">{fieldAgentCount}</h3>
                        </div>
                        <div className="bg-[#F59E0B] p-3 rounded-lg">
                            <UserPlus size={24} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Administrators</option>
                            <option value="fieldagent">Field Agents</option>
                        </select>
                    </div>
                </div>

                {/* Create Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#1B4332] hover:bg-[#2D5F4D] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        Create Field Agent
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-[#1B4332]" size={40} />
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-[#1B4332] text-white">
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
                                        <tr key={user._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#F3F4F6] transition-colors`}>
                                            <td className="py-4 px-6 text-gray-800 font-medium">{user.name || 'N/A'}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail size={16} className="text-gray-400" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-700">{user.username}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.role === 'admin' 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    <Shield size={14} />
                                                    {user.role === 'admin' ? 'Administrator' : 'Field Agent'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.assignedRegion ? (
                                                    <div className="flex items-center gap-1 text-gray-700">
                                                        <MapPin size={16} className="text-[#F59E0B]" />
                                                        {user.assignedRegion}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">All Regions</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {user._id !== authState?.user?.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id, user.username)}
                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <UsersIcon size={48} className="text-gray-300 mb-3" />
                                                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Users Found</h4>
                                                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-[#1B4332]">Create Field Agent</h2>
                            <p className="text-gray-600 text-sm mt-1">Add a new field agent to the system</p>
                        </div>

                        <form onSubmit={handleCreateFieldAgent} className="p-6 space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition ${
                                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter username"
                                />
                                {formErrors.username && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition ${
                                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter email"
                                />
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition ${
                                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter password"
                                />
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition ${
                                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter full name"
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Assigned Region */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Assigned Region <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="assignedRegion"
                                    value={formData.assignedRegion}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition ${
                                        formErrors.assignedRegion ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select region</option>
                                    <option value="Kiambu">Kiambu</option>
                                    <option value="Nyeri">Nyeri</option>
                                    <option value="Murang'a">Murang'a</option>
                                    <option value="Kirinyaga">Kirinyaga</option>
                                    <option value="Embu">Embu</option>
                                </select>
                                {formErrors.assignedRegion && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.assignedRegion}</p>
                                )}
                            </div>

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
                                        setFormData({
                                            username: '',
                                            email: '',
                                            password: '',
                                            name: '',
                                            assignedRegion: ''
                                        });
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
                                    Create Agent
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
