'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Author: Sourav Kumar Das

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const userNavLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    href: '/courses',
    label: 'Browse',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    href: '/courses/my-courses',
    label: 'My Courses',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
];

const adminNavLinks = [
  {
    href: '/dashboard/admin',
    label: 'Dashboard',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    href: '/dashboard/admin/manage',
    label: 'Manage',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    ),
  },
];

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, adminLogout, user } = useAuth();

  const handleLogout = async () => {
    if (isAdmin) {
      await adminLogout();
    } else {
      await logout();
    }
    router.push('/login');
  };

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* ── Navbar ── */}
      <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Left: logo + nav links */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(isAdmin ? '/dashboard/admin' : '/dashboard')}>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-medium">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xl font-bold gradient-text hidden sm:block">Learning Tracker</span>
              </div>

              {isAdmin && (
                <span className="px-2.5 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-soft">
                  Admin
                </span>
              )}

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = pathname === link.href || pathname?.startsWith(link.href + '/');
                  return (
                    <button
                      key={link.href}
                      onClick={() => router.push(link.href)}
                      className={`nav-link ${active ? 'nav-link-active' : ''}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {link.icon}
                      </svg>
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: user email + logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.email?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[160px] truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg hover:from-primary-700 hover:to-indigo-700 shadow-soft hover:shadow-medium transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex gap-1 pb-2">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={`nav-link text-xs ${active ? 'nav-link-active' : ''}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {link.icon}
                  </svg>
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
