'use client';
import Image from 'next/image';
import fondo_transparent from '../../../public/logo/wazilrest_white.png';
import wazilrest_logo from '../../../public/logo/wazilrest_logo.png';

import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Breadcrumb from '../Breadcrumb';

import '../../../src/app/globals.css';
import {
  HomeIcon,
  ServerIcon,
  UserIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  InboxIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  MapPinIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';

function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const email = useSession().data?.user?.email;
  const username = useSession().data?.username;
  const photourl = useSession().data?.user?.image;

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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };
  const menuSections = [
    {
      title: 'Primeros Pasos',
      items: [
        { name: 'Introduction', icon: <HomeIcon className="w-7 h-7 text-gray-200" />, path: '/docs', action: () => handleNavigation('/docs') },
        { name: 'Conecta tu WhatsApp', icon: <DevicePhoneMobileIcon className="w-7 h-7 text-gray-200" />, path: '/docs/whatsapp-connect', action: () => handleNavigation('/docs/whatsapp-connect') },
      ],
    },
    {
      title: 'Enviar mensajes',
      items: [
        { name: 'Send message', icon: <ChatBubbleLeftRightIcon className="w-7 h-7 text-gray-200" />, path: '/docs/send-message', action: () => handleNavigation('/docs/send-message') },
        { name: 'Send image', icon: <PhotoIcon className="w-7 h-7 text-gray-200" />, path: '/docs/send-image', action: () => handleNavigation('/docs/send-image') },
        { name: 'Send audio', icon: <SpeakerWaveIcon className="w-7 h-7 text-gray-200" />, path: '/docs/send-audio', action: () => handleNavigation('/docs/send-audio') },
        { name: 'Send stiker', icon: <SparklesIcon className="w-7 h-7 text-gray-200" />, path: '/docs/send-sticker', action: () => handleNavigation('/docs/send-sticker') },
        { name: 'Send location', icon: <MapPinIcon className="w-7 h-7 text-gray-200" />, path: '/docs/send-location', action: () => handleNavigation('/docs/send-location') },
      ],
    },
    {
      title: 'Recibir Eventos Trigger',
      items: [
        { name: 'Config your Webhook', icon: <Cog6ToothIcon className="w-7 h-7 text-gray-200" />, path: '/docs/config-webhook', action: () => handleNavigation('/docs/config-webhook') },
      ],
    },
    {
      title: 'Integraciones',
      items: [
        { name: 'N8N', icon: <PuzzlePieceIcon className="w-7 h-7 text-gray-200" />, path: '/docs/n8n', action: () => handleNavigation('/docs/n8n') },
      ],
    },
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
      <div
        className={`bg-zinc-900 text-white h-screen ${
          isCollapsed ? 'w-20' : 'w-64'
        } transition-width duration-300 ease-in-out flex flex-col shadow-xl`}
      >
        <div className="p-4 flex items-center border-zinc-700">
          <div className="flex items-center">
            {isCollapsed ? (
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center relative">
              <Image
                src={wazilrest_logo}
                alt="Background Logo"
                height={250}
                width={250}
                quality={100}
                priority
                className="mx-auto"
              />
                  <span className="absolute -right-3.5 -bottom-6 bg-emerald-600 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-lg tracking-widest uppercase ">
                    DOCS
                  </span>
              </div>
            ) : (
                <div className="flex items-center relative">
                  <Image
                    src={fondo_transparent}
                    alt="Background Logo"
                    height={250}
                    width={250}
                    quality={100}
                    priority
                    className="mx-auto"
                  />
                  <span className="absolute right-2 -bottom-3 bg-emerald-600 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-lg tracking-widest uppercase ">
                    DOCS
                  </span>
                </div>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="ml-auto px-1 text-zinc-400 hover:text-white transition-colors duration-200"
          >
            {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-grow py-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {!isCollapsed && (
                <div className="px-3 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  {section.title}
                </div>
              )}
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.path;
                return (
                  <div
                    key={itemIndex}
                    onClick={item.action}
                    className={`relative group flex ${
                      isCollapsed ? 'flex-col items-center' : 'flex-row px-3 items-center'
                    } mx-3 my-2 pt-3 pb-2 rounded-md cursor-pointer transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 shadow-md' : 'hover:bg-zinc-800'
                    } ${item.name === 'Logout' || item.name === 'Config your Webhook' || item.name === 'N8N' ? 'hover:bg-emerald-900/75 text-white' : 'text-white'}`}
                  >
                    <div className={`${isCollapsed ? 'mb-2' : ''} flex-shrink-0`}>{item.icon}</div>

                    {isCollapsed && !isMobile && (
                      <div
                        className={`absolute left-full ml-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block ${
                          item.name === 'Logout' || item.name === 'Config your Webhook' || item.name === 'N8N' ? 'bg-emerald-800' : 'bg-emerald-700'
                        } text-white text-sm px-3 py-1 rounded-md shadow-lg z-10`}
                        style={{ minWidth: '90px', justifyContent: 'center' }}
                      >
                        {item.name}
                      </div>
                    )}

                    {!isCollapsed && (
                      <div className="flex items-center h-full">
                        <span className="text-md ml-4 font-medium">{item.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div
          className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : ''} border-t border-zinc-700 bg-zinc-900/50`}
        >
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden shadow-md">
            {photourl ? (
              <Image
                src={photourl}
                alt="User Photo"
                height={40}
                width={40}
                quality={100}
                className="rounded-full"
              />
            ) : (
              <div className="bg-emerald-600 text-white text-sm font-bold h-full w-full flex items-center justify-center">
                {email ? email.charAt(0).toUpperCase() : 'N/A'}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-100">{username}</div>
              <div className="text-xs text-gray-400">{email}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow bg-gray-50 dark:bg-zinc-800 h-screen overflow-auto">
        {status === 'loading' && (
            <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}
        {status === 'authenticated' && children}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SidebarLayout>
        <Breadcrumb />
        <div className="p-2">{children}</div>
      </SidebarLayout>
    </SessionProvider>
  );
}