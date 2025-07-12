'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteCookie, getCookie } from '@/utils/cookies';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to true since middleware protects routes
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = getCookie('token');
    setIsLoggedIn(!!token);
  }, []);

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
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

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center space-x-2">
          {/* ✅ CHANGE LOGO HERE */}
          {/* This is where your new logo is added from /public/logo.png */}
          <Image 
            src="/logo.png"         // Path from public folder
            alt="SkillX Logo"       // Accessibility
            width={36}              // Adjust size as needed
            height={36}
            className="rounded-md"  // Optional: Add rounded corners
            priority                // Optional: Preload for performance
          />
          {/* ✅ Project Name beside Logo */}
          <span className="text-xl font-bold text-gray-800">SkillX</span>
        </Link>

        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              <Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Home</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Dashboard</Link>
              <Link href="/profile" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Profile</Link>
              <Link href="/match" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Match</Link>
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors font-medium bg-transparent border-none cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Login</Link>
              <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
