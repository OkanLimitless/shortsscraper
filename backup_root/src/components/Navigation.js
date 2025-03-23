'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Generator' },
    { href: '/examples', label: 'Examples' }
  ];
  
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 py-2">
        <ul className="flex space-x-6">
          {links.map(link => (
            <li key={link.href}>
              <Link 
                href={link.href}
                className={`py-2 font-medium ${
                  pathname === link.href 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 