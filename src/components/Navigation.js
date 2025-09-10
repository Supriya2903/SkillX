'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { deleteCookie, getCookie } from '@/utils/cookies';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, MessageCircle, User, Settings, LogOut, Menu, X,
  Home, LayoutDashboard, Users, Target, Award, Plus
} from 'lucide-react';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const token = getCookie('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchUser();
      fetchNotifications();
      fetchUnreadMessageCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadMessageCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/profile', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications.slice(0, 5)); // Show only recent 5
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const res = await fetch('/api/messages', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const totalUnread = (data.conversations || []).reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadMessageCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <span className="text-xl font-bold">SkillX</span>
          <div className="space-x-4">Loading...</div>
        </div>
      </nav>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.log('Logout API error:', error);
    }

    deleteCookie('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const isActivePath = (path) => pathname === path;

  const NavLink = ({ href, children, icon: Icon, mobile = false }) => {
    const active = isActivePath(href);
    const baseClasses = mobile
      ? "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-base font-medium"
      : "flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors font-medium";
    
    const activeStyle = active
      ? { backgroundColor: '#F0E9E2', color: '#865D36' }
      : { color: '#5A4E44' };

    const hoverProps = !active ? {
      onMouseEnter: (e) => {
        e.target.style.color = '#865D36';
        e.target.style.backgroundColor = '#F6F2ED';
      },
      onMouseLeave: (e) => {
        e.target.style.color = '#5A4E44';
        e.target.style.backgroundColor = 'transparent';
      }
    } : {};

    return (
      <Link href={href} className={baseClasses} style={activeStyle} {...hoverProps}>
        {Icon && <Icon className="h-4 w-4" />}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className="backdrop-blur-md border-b sticky top-0 z-50 shadow-sm" style={{backgroundColor: 'rgba(252, 250, 247, 0.9)', borderColor: '#D5C7BC'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <Image 
                src="/logo.png"
                alt="SkillX Logo"
                width={32}
                height={32}
                className="rounded-md"
                priority
              />
              <span className="text-xl font-bold" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                SkillX
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink href="/match" icon={Users}>Match</NavLink>
                <NavLink href="/add-skill" icon={Plus}>Add Skill</NavLink>
                <NavLink href="/profile" icon={User}>Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/">Home</NavLink>
                <Link href="/login" className="text-gray-600 transition-colors font-medium px-3 py-2"
                  style={{color: '#5A4E44'}}
                  onMouseEnter={(e) => e.target.style.color = '#865D36'}
                  onMouseLeave={(e) => e.target.style.color = '#5A4E44'}
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Search */}
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
                  <Search className="h-5 w-5" />
                </button>

                {/* Messages */}
                <Link href="/messages" className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative hidden sm:block">
                  <MessageCircle className="h-5 w-5" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification._id}
                                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
                                  !notification.isRead ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                  markNotificationAsRead(notification._id);
                                  if (notification.actionUrl) {
                                    router.push(notification.actionUrl);
                                  }
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                                      {notification.type === 'skill_match' ? '🎯' : 
                                       notification.type === 'new_message' ? '💬' :
                                       notification.type === 'badge_earned' ? '🏆' : '🔔'}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p>No notifications yet</p>
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <Link
                            href="/notifications"
                            className="text-sm font-medium"
                            style={{color: '#865D36'}}
                            onMouseEnter={(e) => e.target.style.color = '#B8956A'}
                            onMouseLeave={(e) => e.target.style.color = '#865D36'}
                            onClick={() => setShowNotifications(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        user?.name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowProfile(false)}
                          >
                            <User className="h-4 w-4 mr-3" />
                            Your Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowProfile(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3" />
                            Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowProfile(false)}
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Settings
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={() => {
                              setShowProfile(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                href="/signup"
                className="text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105"
                style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
              >
                Sign Up
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {isLoggedIn ? (
                <>
                  <NavLink href="/dashboard" icon={LayoutDashboard} mobile>Dashboard</NavLink>
                  <NavLink href="/match" icon={Users} mobile>Match</NavLink>
                  <NavLink href="/add-skill" icon={Plus} mobile>Add Skill</NavLink>
                  <NavLink href="/profile" icon={User} mobile>Profile</NavLink>
                  <NavLink href="/messages" icon={MessageCircle} mobile>Messages</NavLink>
                  <NavLink href="/notifications" icon={Bell} mobile>Notifications</NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink href="/" icon={Home} mobile>Home</NavLink>
                  <NavLink href="/login" icon={User} mobile>Login</NavLink>
                  <div className="px-4 py-2">
                    <Link
                      href="/signup"
                      className="text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-200 font-medium w-full block text-center"
                      style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </nav>
  );
}
