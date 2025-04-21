'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiBarChart2, 
  FiPackage, 
  FiSend, 
  FiSettings, 
  FiUsers, 
  FiDollarSign, 
  FiMessageCircle,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export function BusinessSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/business',
      icon: <FiBarChart2 className="h-5 w-5" />,
      isActive: pathname === '/business',
    },
    {
      title: 'Products',
      href: '/business/products',
      icon: <FiPackage className="h-5 w-5" />,
      isActive: pathname.startsWith('/business/products'),
    },
    {
      title: 'Promotions',
      href: '/business/promotions',
      icon: <FiSend className="h-5 w-5" />,
      isActive: pathname.startsWith('/business/promotions'),
    },
    {
      title: 'Marketers',
      href: '/business/marketers',
      icon: <FiUsers className="h-5 w-5" />,
      isActive: pathname.startsWith('/business/marketers'),
    },
    {
      title: 'Earnings',
      href: '/business/earnings',
      icon: <FiDollarSign className="h-5 w-5" />,
      isActive: pathname.startsWith('/business/earnings'),
    },
    {
      title: 'Messages',
      href: '/business/messages',
      icon: <FiMessageCircle className="h-5 w-5" />,
      isActive: pathname.startsWith('/business/messages'),
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <FiSettings className="h-5 w-5" />,
      isActive: pathname === '/settings',
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } hidden h-screen flex-shrink-0 flex-col border-r bg-white transition-all duration-300 md:flex`}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {isOpen ? (
          <div className="flex items-center">
            <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-8 w-auto mr-2" />
            <span className="text-lg font-semibold text-primary-600">Business</span>
          </div>
        ) : (
          <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-8 w-auto mx-auto" />
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                item.isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {isOpen && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}