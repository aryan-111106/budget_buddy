import React, { useState, useEffect } from 'react';
import { X, User, LogOut, Hash, ShieldCheck, Mail, Phone, MapPin, Edit2, Save, Loader2, FileText, Camera } from 'lucide-react';
import { User as UserType } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<UserType>) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
        setError("Name and Email are required");
        setLoading(false);
        return;
    }

    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset form to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="relative p-6 pb-0 flex flex-col items-center">
            <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
            <X className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-4xl shadow-[0_0_30px_rgba(168,85,247,0.3)] mb-4 border-4 border-[#121215] ring-2 ring-white/10">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-[#121215]">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>

            {/* View Mode: Name & ID */}
            {!isEditing && (
                <>
                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 mb-2">
                        <Hash className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400 font-mono tracking-wider">{user.id}</span>
                    </div>
                    {user.bio && <p className="text-sm text-gray-400 text-center max-w-xs mb-4 italic">"{user.bio}"</p>}
                </>
            )}

            {/* Toggle Edit Button (Only in View Mode) */}
            {!isEditing && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 left-4 p-2 text-gray-400 hover:text-purple-400 hover:bg-white/10 rounded-full transition-colors"
                    title="Edit Profile"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            )}
        </div>

        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {isEditing ? (
                // --- Edit Mode Form ---
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+1 (555) 000-0000"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                            <textarea 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="123 Financial St, Tech City"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none h-20"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Bio</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                placeholder="A short bio about yourself..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none h-20"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // --- View Mode Details ---
                <div className="space-y-3">
                     <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm font-medium text-white">{user.email}</p>
                            </div>
                        </div>
                     </div>

                     <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Phone</p>
                                <p className="text-sm font-medium text-white">{user.phone || 'Not set'}</p>
                            </div>
                        </div>
                     </div>

                     <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Address</p>
                                <p className="text-sm font-medium text-white max-w-[200px] truncate">{user.address || 'Not set'}</p>
                            </div>
                        </div>
                     </div>

                     <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Account Type</p>
                                <p className="text-sm font-medium text-white">Personal Pro</p>
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2">
            {isEditing ? (
                <div className="flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        onLogout();
                        onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 rounded-xl transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Log Out</span>
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;