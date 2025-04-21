'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiSettings, 
  FiHelpCircle,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi';

type SidebarItemProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  current: boolean;
  children?: { title: string; href: string }[];
};

interface NavigationItem {
  href: string;
  icon: React.ReactNode;
  title: string;
  current: boolean;
  children?: { title: string; href: string }[];
}

const SidebarItem = ({ href, icon, title, current, children }: SidebarItemProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() => {
    // Open by default if any child is active
    return children?.some(child => child.href === pathname) || current;
  });
  
  const hasChildren = children && children.length > 0;

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            current || children.some(child => child.href === pathname)
              ? 'bg-primary-100 text-primary-600'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3 text-lg">{icon}</span>
            {title}
          </div>
          {isOpen ? (
            <FiChevronDown className="h-4 w-4" />
          ) : (
            <FiChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="mt-1 space-y-1 pl-10">
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  pathname === child.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`mb-1 flex items-center rounded-md px-3 py-2 text-sm font-medium ${
        current
          ? 'bg-primary-100 text-primary-600'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-3 text-lg">{icon}</span>
      {title}
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Define navigation items with role-based conditions
  const navigation: NavigationItem[] = [
    {
      href: '/home',
      icon: <FiHome />,
      title: 'Home',
      current: pathname === '/home',
    },
    {
      href: '/products',
      icon: <FiPackage />,
      title: 'Products',
      current: pathname.startsWith('/products'),
    },
    // Only show Marketers menu to admin users
    ...(isAdmin ? [{
      href: '/users',
      icon: <FiUsers />,
      title: 'Users',
      current: pathname.startsWith('/users'),
    }] : []),
    {
      href: '/promotions',
      icon: <FiBarChart2 />,
      title: 'Promotions',
      current: pathname.startsWith('/promotions'),
    },
    {
      href: '/earnings',
      icon: <FiDollarSign />,
      title: 'Earnings',
      current: pathname.startsWith('/earnings'),
    },
    {
      href: '/social-accounts',
      icon: <FiUsers />,
      title: 'Social Media Accounts',
      current: pathname.startsWith('/social-accounts'),
    },
  ];

  const bottomNavigation: NavigationItem[] = [
    {
      href: '/settings',
      icon: <FiSettings />,
      title: 'Settings',
      current: pathname.startsWith('/settings'),
    },
    {
      href: '/help',
      icon: <FiHelpCircle />,
      title: 'Help & Support',
      current: pathname.startsWith('/help'),
    },
  ];

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex flex-shrink-0 items-center px-4 h-16 border-b border-gray-200 gap-2">
        <Link href="/home" className="flex items-center">
          <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-10 w-auto" />
        </Link>
        <span className="text-xl font-bold text-primary-600">BoostFlow</span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-3" aria-label="Sidebar">
          <div className="space-y-1 mb-6">
            {navigation.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                current={item.current}
                children={item.children}
              />
            ))}
          </div>
          <div className="pt-6 mt-6 border-t border-gray-200 space-y-1">
            {bottomNavigation.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                current={item.current}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
} 