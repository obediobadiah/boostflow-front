'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiBarChart2, 
  FiSearch, 
  FiSend, 
  FiSettings, 
  FiLink, 
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

export function MarketerSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/marketer',
      icon: <FiBarChart2 className="h-5 w-5" />,
      isActive: pathname === '/marketer',
    },
    {
      title: 'Discover Products',
      href: '/marketer/discover',
      icon: <FiSearch className="h-5 w-5" />,
      isActive: pathname.startsWith('/marketer/discover'),
    },
    {
      title: 'My Promotions',
      href: '/marketer/promotions',
      icon: <FiSend className="h-5 w-5" />,
      isActive: pathname.startsWith('/marketer/promotions'),
    },
    {
      title: 'Tracking Links',
      href: '/marketer/links',
      icon: <FiLink className="h-5 w-5" />,
      isActive: pathname.startsWith('/marketer/links'),
    },
    {
      title: 'Earnings',
      href: '/marketer/earnings',
      icon: <FiDollarSign className="h-5 w-5" />,
      isActive: pathname.startsWith('/marketer/earnings'),
    },
    {
      title: 'Messages',
      href: '/marketer/messages',
      icon: <FiMessageCircle className="h-5 w-5" />,
      isActive: pathname.startsWith('/marketer/messages'),
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <FiSettings className="h-5 w-5" />,
      isActive: pathname === '/settings',
    },
  ];

  return (
    <div
      className={`${
        expanded ? 'w-64' : 'w-20'
      } hidden h-screen flex-shrink-0 flex-col border-r bg-white transition-all duration-300 md:flex`}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {expanded ? (
          <div className="flex items-center">
            <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-8 w-auto mr-2" />
            <span className="text-lg font-semibold text-secondary-600">Marketer</span>
          </div>
        ) : (
          <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-8 w-auto mx-auto" />
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          {expanded ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
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
                  ? 'bg-secondary-50 text-secondary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {expanded && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 