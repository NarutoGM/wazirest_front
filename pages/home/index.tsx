'use client';
import Image from 'next/image';
import fondo_transparent from '../../public/logo/wazilrest_white.png'
import wazilrest_logo from '../../public/logo/wazilrest_logo.png'

import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import "../../src/app/globals.css";
import {
  HomeIcon,
  ServerIcon,
  UserIcon,
  InboxIcon,
  LinkIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const email = useSession().data?.user?.email;
  const username = useSession().data?.username;
  const photourl = useSession().data?.user?.image;

  console.log('useSession():', useSession());
  const [hasMounted, setHasMounted] = useState(false);

  const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 768;

  const [isMobile, setIsMobile] = useState(isMobileInitial);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return isMobileInitial;
    }
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState !== null ? JSON.parse(savedState) : isMobileInitial;
  });

  useEffect(() => {
    setHasMounted(true);

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    } else {
      setIsCollapsed(isMobile);
    }
  }, [isMobile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Handle logout function
  const handleLogout = async () => {
    await signOut({ greenirect: false });
    router.push('/login');
  };

  const menuItems = [
    { name: 'Home', icon: <HomeIcon className="w-8 h-8 text-white" />, path: '/home', action: () => handleNavigation('/home') },
    { name: 'Instances', icon: <ServerIcon className="w-8 h-8 text-white" />, path: '/instances', action: () => handleNavigation('/instances') },
    { name: 'Profile', icon: <UserIcon className="w-8 h-8 text-white" />, path: '/profile', action: () => handleNavigation('/profile') },
    { name: 'Subscription', icon: <InboxIcon className="w-8 h-8 text-white" />, path: '/subscription', action: () => handleNavigation('/subscription') },
    { name: 'Documentations', icon: <DocumentTextIcon className="w-8 h-8 text-white" />, path: '/docs', action: () => handleNavigation('/docs') },
    { name: 'Logout', icon: <ArrowLeftOnRectangleIcon className="w-8 h-8 text-white" />, path: '/login', action: handleLogout },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="flex">
      <div className={`bg-zinc-950 text-white h-screen ${isCollapsed ? 'w-20' : 'w-60'} transition-width duration-300 ease-in-out flex flex-col`}>
        <div className="p-4 flex items-center">
          <div className="flex items-center">
            {isCollapsed ? (
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">

                <Image
                  src={wazilrest_logo}
                  alt="Background Logo"
                  height={250}
                  width={250}
                  quality={100}
                  priority
                  className="mx-auto"
                />

              </div>
            ) : (
              <div className="flex items-center">

                <Image
                  src={fondo_transparent}
                  alt="Background Logo"
                  height={250}
                  width={250}
                  quality={100}
                  priority
                  className="mx-auto"
                />
              </div>
            )}
          </div>
          <button onClick={toggleCollapse} className="ml-auto px-1 text-zinc-400">
            {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-grow">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              className={`relative group flex ${isCollapsed ? 'flex-col items-center' : 'flex-row px-3 items-center'
                } m-2 pt-3 pb-2 hover:bg-green-800/35 rounded cursor-pointer transition-colors duration-200`}
            >
              <div className="mb-2 flex-shrink-0">{item.icon}</div>
              {/* Tooltip: Show only when collapsed and not on mobile */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block bg-green-800 text-white text-sm px-3 py-1 rounded-md shadow-lg z-10">
                  {item.name}
                </div>
              )}
              {!isCollapsed && (
                <div className="flex items-center h-full">
                  <span className="text-md ml-5">{item.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`mt-auto p-4 flex items-center ${isCollapsed ? 'justify-center' : ''} border-t border-zinc-700`}>
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center overflow-hidden">
            {photourl ? (
              <Image
                src={photourl}
                alt="User Photo"
                height={32}
                width={32}
                quality={100}
                className="rounded-full"
              />
            ) : (
              <div className="bg-gray-700 text-white text-sm font-bold h-full w-full flex items-center justify-center">
                {email ? email.charAt(0).toUpperCase() : 'N/A'}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <div className="text-sm font-medium">{username}</div>
              <div className="text-xs text-zinc-400">{email}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow p-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
        {status === 'loading' && <div>Loading...</div>}
        {status === 'authenticated' && children}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SidebarLayout>{children}</SidebarLayout>
    </SessionProvider>
  );
}