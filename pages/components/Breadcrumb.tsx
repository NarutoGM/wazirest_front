'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Breadcrumb() {
    const pathname = usePathname();
    if (!pathname) return null;

    const pathParts = pathname.split('/').filter(Boolean);

    return (
        <nav className="bg-zinc-800  shadow-zinc-800">
            <div className="px-12 py-8 flex items-center border-b-2 border-zinc-700">
                <ol className="flex items-center space-x-1 text-sm">
                    <li>
                        <Link 
                            href="/"
                            className="flex items-center text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
                        >
                            <HomeIcon className="w-4 h-4 mr-1" />
                            <span className="text-xl font-medium">Home</span>
                        </Link>
                    </li>

                    {pathParts.map((part, index) => {
                        const href = '/' + pathParts.slice(0, index + 1).join('/');
                        const isLast = index === pathParts.length - 1;
                        const label = decodeURIComponent(part);

                        return (
                            <li key={index} className="flex items-center space-x-1">
                                <ChevronRightIcon className="w-4 h-4 text-zinc-500" />
                                {isLast ? (
                                    <span className="text-white text-xl capitalize font-semibold px-1">{label}</span>
                                ) : (
                                    <Link
                                        href={href}
                                        className="text-zinc-400 hover:text-zinc-300 transition-colors duration-200 capitalize px-1"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </nav>
    );
}