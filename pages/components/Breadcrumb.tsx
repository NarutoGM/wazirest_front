// components/Breadcrumb.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Breadcrumb() {
    const pathname = usePathname(); // Ej: "/productos/aceite"
    if (!pathname) return null; 

    const pathParts = pathname.split('/').filter(Boolean);
    
    return (
        <nav className="text-sm text-gray-400 bg-zinc-800 p-6">
            <ol className="list-reset flex items-center space-x-2">
                <li>
                    <Link href="/" className="text-green-500 hover:underline font-medium">
                        Home
                    </Link>
                </li>

                {pathParts.map((part, index) => {
                    const href = '/' + pathParts.slice(0, index + 1).join('/');
                    const isLast = index === pathParts.length - 1;
                    const label = decodeURIComponent(part);

                    return (
                        <li key={index} className="flex items-center space-x-2">
                            <span className="text-gray-500">/</span>
                            {isLast ? (
                                <span className="text-gray-300 capitalize font-semibold">{label}</span>
                            ) : (
                                <Link
                                    href={href}
                                    className="text-green-500 hover:underline capitalize font-medium"
                                >
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
