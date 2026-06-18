import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Camera, User, Phone, Mail, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { cameraService } from '../services/cameraService';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { hapticService } from '../services/hapticService';
import { motion } from 'motion/react';

export function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser, isLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !isInitialized) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setIsInitialized(true);
    }
  }, [user, isLoading, isInitialized]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarPick = async () => {
    hapticService.impact();
    
    if (Capacitor.isNativePlatform()) {
      setAvatarLoading(true);
      try {
        const photo = await cameraService.pickFromGallery();
        if (photo) {
          setAvatar(photo);
          toast.success('Avatar selected from gallery!');
        }
      } catch (err) {
        console.error('Capacitor photo pick failed:', err);
      } finally {
        setAvatarLoading(false);
      }
    } else {
      // Fallback to web file picker
      fileInputRef.current?.click();
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB. Compress it first or use a smaller photo.');
      return;
    }

    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        toast.success('Avatar loaded!');
      }
      setAvatarLoading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setAvatarLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile({ name, phone, avatar });
      updateUser({ name, phone, avatar });
      hapticService.notificationSuccess();
      toast.success('Profile updated successfully!');
      navigate(-1);
    } catch (err: any) {
      hapticService.impact();
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-surface-secondary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary ml-2">Edit Profile</h1>
      </div>

      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* Profile Avatar Selection Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-indigo-400">
              <div className="w-full h-full bg-white dark:bg-surface rounded-full overflow-hidden border-2 border-white dark:border-surface flex items-center justify-center relative">
                {avatarLoading ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                ) : avatar ? (
                  <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 text-3xl font-bold flex items-center justify-center">
                    {name.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={avatarLoading}
              className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface hover:bg-blue-700 active:scale-90 transition-all cursor-pointer"
            >
              <Camera size={16} />
            </button>
          </div>
          
          <p className="text-xs text-gray-400 dark:text-text-tertiary mt-3">
            Tap the camera icon to upload or capture a profile photo
          </p>
          <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-1 font-medium">
            Max 2 MB · JPG, PNG, or WebP
          </p>

          {/* Web Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleWebFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email input (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail size={12} />
              <span>Email Address (Read-only)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-gray-100 dark:bg-surface-tertiary border border-gray-200 dark:border-border-light/50 rounded-xl py-3.5 px-4 text-sm text-gray-400 dark:text-text-tertiary outline-none cursor-not-allowed opacity-80 font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <ShieldAlert size={16} />
              </div>
            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User size={12} />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-surface border border-gray-200 dark:border-border-light rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 dark:text-text-primary placeholder-gray-400 dark:placeholder-text-tertiary font-medium shadow-sm"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Phone size={12} />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white dark:bg-surface border border-gray-200 dark:border-border-light rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 dark:text-text-primary placeholder-gray-400 dark:placeholder-text-tertiary font-medium shadow-sm"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Saving Changes...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
          
        </form>

      </div>
    </div>
  );
}
