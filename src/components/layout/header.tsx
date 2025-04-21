'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiBell, FiSettings, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';

interface HeaderProps {
  setSidebarOpen?: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await dispatch(logout());
      setShowLogoutConfirm(false);
      // Redirect to landing page after logout
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutConfirm(false);
      // If there's an error, still redirect to landing page
      router.push('/');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-30 sticky top-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            {setSidebarOpen && (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              </button>
            )}

            {/* <div className="flex flex-shrink-0 items-center px-4 h-16 border-b border-gray-200 gap-2 md:hidden">
              <Link href="/home" className="flex items-center">
                <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-10 w-auto" />
              </Link>
              <span className="text-xl font-bold text-primary-600">BoostFlow</span>
            </div> */}
            
          </div>

          {/* User profile and navigation */}
          <div className="flex items-center space-x-3">
            {/* Notification bell */}
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span className="sr-only">View notifications</span>
              <FiBell className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <div className="flex items-center">
                <button
                  type="button"
                  className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                </button>
                <div className="ml-3 hidden md:block">
                  <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Link
                    href="/settings/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <FiSettings className="mr-2" /> Profile Settings
                    </div>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiLogOut className="mr-2" /> Logout
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Logout Confirmation</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to logout from your account?
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 