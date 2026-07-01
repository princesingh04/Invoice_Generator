import { useState } from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

/**
 * Navigation items — each maps to a page key used by App routing.
 */
const NAV_ITEMS = [
  { key: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { key: 'builder',    label: 'New Invoice',   icon: FilePlus2 },
  { key: 'invoices',   label: 'Invoices',      icon: FileText },
  { key: 'customers',  label: 'Customers',     icon: Users },
  { key: 'settings',   label: 'Settings',      icon: Settings },
];

/**
 * Sidebar — fixed left navigation with glassmorphism.
 * @param {{ currentPage: string, onNavigate: (page: string) => void }} props
 */
export default function Sidebar({ currentPage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      id="sidebar"
      className={`
        fixed z-40 flex
        transition-all duration-300 ease-in-out
        /* Mobile: fixed bottom nav */
        bottom-0 left-0 w-full h-16 flex-row border-t border-white/[0.06]
        /* Desktop: fixed side nav */
        md:top-0 md:h-screen md:flex-col md:border-t-0 md:border-r md:w-64
      `}
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Logo / Brand ──────────────────────────────── */}
      <div className="hidden md:flex items-center gap-3 px-5 pt-7 pb-6">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          }}
        >
          <Sparkles size={20} className="text-white" />
        </div>

        <div className="animate-fade-in">
          <h1 className="text-lg font-bold gradient-text leading-tight">
            InvoiceAI
          </h1>
          <p className="text-[11px] text-surface-400 leading-none mt-0.5">
            Smart Billing
          </p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 flex flex-row md:flex-col items-center justify-around md:items-stretch gap-1 px-2 md:px-3 mt-0 md:mt-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = currentPage === key;
          return (
            <button
              key={key}
              id={`nav-${key}`}
              onClick={() => onNavigate(key)}
              className={`
                group relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 rounded-xl
                px-2 py-1.5 md:px-3 md:py-2.5 text-[10px] md:text-sm font-medium cursor-pointer
                transition-all duration-200 w-full md:w-auto
                ${active
                  ? 'text-brand-400 md:bg-white/10 md:text-white'
                  : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                }
              `}
            >
              {/* Active glow bar (desktop) */}
              {active && (
                <span
                  className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-pulse-glow"
                  style={{ background: 'linear-gradient(180deg, #818cf8, #a78bfa)' }}
                />
              )}
              {/* Active glow bar (mobile) */}
              {active && (
                <span
                  className="block md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full animate-pulse-glow"
                  style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa)' }}
                />
              )}

              <Icon
                size={20}
                className={`flex-shrink-0 transition-colors duration-200
                  ${active ? 'text-brand-400' : 'text-surface-500 group-hover:text-brand-400'}
                `}
              />

              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
