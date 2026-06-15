// ─── Detail Pals V2 — Admin Layout ──────────────────────────────────
// Shared shell for all admin pages. Includes sidebar nav + sign out.
// Lives entirely in /admin — never imported by the public frontend.

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',             label: 'Dashboard',    end: true },
  { to: '/admin/bookings',    label: 'Bookings'               },
  { to: '/admin/history',     label: 'History'                },
  { to: '/admin/customers',   label: 'Customers'              },
  { to: '/admin/contacts',    label: 'Messages'               },
  { to: '/admin/services',    label: 'Services'               },
  { to: '/admin/email-logs',  label: 'Email Logs'             },
  { to: '/admin/gallery',     label: 'Gallery'                },
  { to: '/admin/testimonials',label: 'Testimonials'           },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/10 flex flex-col">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-xs tracking-[4px] text-white/80 uppercase font-light">Detail Pals</p>
          <p className="text-[10px] tracking-[2px] text-white/30 uppercase mt-1">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-6 py-2.5 text-sm tracking-wider transition-colors ${
                  isActive
                    ? 'text-white bg-white/8'
                    : 'text-white/40 hover:text-white/70'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Sign out */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-[10px] text-white/30 truncate mb-2">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-wider uppercase"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}
