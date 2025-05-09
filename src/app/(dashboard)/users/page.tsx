'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter, 
  FiUser, FiUsers, FiShield, FiMail, FiCheck, FiX,
  FiRefreshCw, FiUserCheck, FiUserX, FiLock
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/redux/store';
import { userService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  profilePicture?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    active: true,
    password: '',
    confirmPassword: '',
  });
  const [processingAction, setProcessingAction] = useState(false);

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      router.push('/home');
    }
  }, [currentUser, router]);

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data.users || data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const refreshUsers = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Handle search and filtering
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.active !== false) || 
      (statusFilter === 'inactive' && user.active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open edit modal with user data
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      active: user.active !== false, // Default to true if undefined
      password: '',
      confirmPassword: '',
    });
    setEditModalOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Save edited user data
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      setProcessingAction(true);
      
      // Validate password if provided
      if (editForm.password) {
        if (editForm.password !== editForm.confirmPassword) {
          toast.error('Passwords do not match');
          setProcessingAction(false);
          return;
        }
        
        if (editForm.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setProcessingAction(false);
          return;
        }
      }
      
      // Create payload without confirmPassword field
      const payload = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        active: editForm.active,
        ...(editForm.password ? { password: editForm.password } : {})
      };
      
      // Update user data
      await userService.updateUser(selectedUser.id, payload);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              name: editForm.name,
              email: editForm.email,
              role: editForm.role,
              active: editForm.active
            }
          : user
      ));
      
      toast.success('User updated successfully');
      setEditModalOpen(false);
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    } finally {
      setProcessingAction(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setProcessingAction(true);
      await userService.deleteUser(selectedUser.id);
      
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    } finally {
      setProcessingAction(false);
    }
  };

  // Quick role update
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userService.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      toast.success('User role updated successfully');
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    }
  };

  // Toggle user status
  const toggleUserStatus = async (user: User) => {
    try {
      // Properly toggle the status - if it's false, make it true; if it's true or undefined, make it false
      const currentActive = user.active !== false; // true or undefined = active
      const newStatus = !currentActive;
      
      await userService.updateUser(user.id, { active: newStatus });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, active: newStatus }
          : u
      ));
      
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'business':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'promoter':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin':
        return <FiShield className="mr-1 h-3 w-3" />;
      case 'business':
        return <FiUsers className="mr-1 h-3 w-3" />;
      case 'promoter':
        return <FiUser className="mr-1 h-3 w-3" />;
      default:
        return null;
    }
  };

  // Helper function for safe ID comparison
  const isSameUser = (userId: string, currentUserId: number | string | undefined): boolean => {
    if (!userId || !currentUserId) return false;
    return String(userId) === String(currentUserId);
  };

  // Safe date formatting helper
  const formatDateSafe = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Unknown';
    return formatDate(typeof dateString === 'string' ? dateString : dateString.toString());
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Determine if a user is inactive based on the active property
  const isUserInactive = (user: User): boolean => {
    return user.active === false;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage user accounts and permissions</p>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshUsers}
              disabled={refreshing}
              className="bg-gray-50 hover:bg-gray-100"
            >
              <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users by name, email or role..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-36 bg-white border-gray-200 focus:ring-orange-500 dark:bg-transparent">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="promoter">Promoter</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-36 bg-white border-gray-200 focus:ring-orange-500 dark:bg-transparent">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                className="md:hidden"
                onClick={refreshUsers}
                disabled={refreshing}
              >
                <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>{filteredUsers.length} users found</div>
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-orange-600"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 uppercase font-semibold">
                          {user.name ? user.name.charAt(0) : '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 md:hidden">{user.email}</div>
                          <div className="sm:hidden mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${isUserInactive(user) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {isUserInactive(user) ? 'Inactive' : 'Active'}
                            </span>
                          </div>
                          {isSameUser(user.id, currentUser?.id) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center">
                        <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        isUserInactive(user) 
                          ? 'text-red-700 bg-red-50'
                          : 'text-green-700 bg-green-50'
                      }`}>
                        {isUserInactive(user) ? (
                          <><FiUserX className="mr-1.5 h-4 w-4" /> Inactive</>
                        ) : (
                          <><FiUserCheck className="mr-1.5 h-4 w-4" /> Active</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {formatDateSafe(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        
                        {!isSameUser(user.id, currentUser?.id) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FiUsers className="h-10 w-10 text-gray-400 mb-2" />
                      <h3 className="text-sm font-medium text-gray-900">No users found</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'No users in the system yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-lg dark:border-gray-200 dark:bg-white dark:text-gray-900">
          <DialogHeader className="dark:text-gray-900">
            <DialogTitle className="flex items-center dark:text-gray-900">
              <FiEdit className="mr-2 h-5 w-5 text-orange-500" />
              Edit User
            </DialogTitle>
            <DialogDescription className="dark:text-gray-500">
              Make changes to the user's information and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium flex items-center">
                <FiUser className="mr-2 h-4 w-4 text-gray-500" />
                Name
              </label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center">
                <FiMail className="mr-2 h-4 w-4 text-gray-500" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium flex items-center">
                <FiShield className="mr-2 h-4 w-4 text-gray-500" />
                Role
              </label>
              <Select 
                value={editForm.role} 
                onValueChange={(value: string) => setEditForm({ ...editForm, role: value })}
                disabled={selectedUser?.id === currentUser?.id} // Prevent changing own role
              >
                <SelectTrigger className={`border-gray-300 ${getRoleBadgeClass(editForm.role)} bg-white dark:bg-transparent`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="promoter">Promoter</SelectItem>
                </SelectContent>
              </Select>
              {selectedUser?.id === currentUser?.id && (
                <p className="text-xs text-amber-600 mt-1 flex items-center">
                  <FiX className="mr-1 h-3 w-3" />
                  You cannot change your own role
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <FiUserCheck className="mr-2 h-4 w-4 text-gray-500" />
                Status
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={editForm.active ? "default" : "outline"}
                  size="sm"
                  className={editForm.active ? "bg-green-600 hover:bg-green-700" : "bg-white hover:bg-gray-100"}
                  onClick={() => setEditForm({ ...editForm, active: true })}
                  disabled={selectedUser?.id === currentUser?.id}
                >
                  <FiCheck className="mr-1.5 h-4 w-4" />
                  Active
                </Button>
                <Button
                  type="button"
                  variant={!editForm.active ? "default" : "outline"}
                  size="sm"
                  className={!editForm.active ? "bg-red-600 hover:bg-red-700" : "bg-white hover:bg-gray-100"}
                  onClick={() => setEditForm({ ...editForm, active: false })}
                  disabled={selectedUser?.id === currentUser?.id}
                >
                  <FiX className="mr-1.5 h-4 w-4" />
                  Inactive
                </Button>
              </div>
              {selectedUser?.id === currentUser?.id && (
                <p className="text-xs text-amber-600 mt-1 flex items-center">
                  <FiX className="mr-1 h-3 w-3" />
                  You cannot deactivate your own account
                </p>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center mb-2">
                <FiLock className="mr-2 h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium">Change Password</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Leave blank to keep the current password</p>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium">New Password</label>
                  <Input
                    id="password"
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="border-gray-300"
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    className="border-gray-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={processingAction}
              className="bg-white hover:bg-gray-100 dark:bg-white dark:text-gray-900 dark:border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={processingAction || !editForm.name || !editForm.email || !editForm.role}
              className="bg-orange-600 hover:bg-orange-700 text-white dark:text-white"
            >
              {processingAction ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200 shadow-lg dark:border-gray-200 dark:bg-white dark:text-gray-900">
          <AlertDialogHeader className="dark:text-gray-900">
            <AlertDialogTitle className="text-red-600 flex items-center dark:text-red-600">
              <FiTrash2 className="mr-2 h-5 w-5" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-600">
              <p>Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-gray-900">{selectedUser?.name}</span>?</p>
              <p className="mt-2">This action cannot be undone. This will permanently delete the user account and remove their data from our servers.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={processingAction}
              className="bg-white hover:bg-gray-100 dark:bg-white dark:text-gray-900 dark:border-gray-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={processingAction}
              className="bg-red-600 hover:bg-red-700 text-white dark:text-white"
            >
              {processingAction ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 