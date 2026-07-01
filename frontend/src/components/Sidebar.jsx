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
        fixed top-0 left-0 h-screen z-40 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
      style={{
        background: 'rgba(15, 23, 42, 0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Logo / Brand ──────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pt-7 pb-6">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          }}
        >
          <Sparkles size={20} className="text-white" />
        </div>

        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold gradient-text leading-tight">
              InvoiceAI
            </h1>
            <p className="text-[11px] text-surface-400 leading-none mt-0.5">
              Smart Billing
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = currentPage === key;
          return (
            <button
              key={key}
              id={`nav-${key}`}
              onClick={() => onNavigate(key)}
              className={`
                group relative flex items-center gap-3 rounded-xl
                px-3 py-2.5 text-sm font-medium cursor-pointer
                transition-all duration-200
                ${active
                  ? 'bg-white/10 text-white'
                  : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                }
              `}
            >
              {/* Active glow bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-pulse-glow"
                  style={{ background: 'linear-gradient(180deg, #818cf8, #a78bfa)' }}
                />
              )}

              <Icon
                size={20}
                className={`flex-shrink-0 transition-colors duration-200
                  ${active ? 'text-brand-400' : 'text-surface-500 group-hover:text-brand-400'}
                `}
              />

              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Collapse toggle ───────────────────────────── */}
      <div className="px-3 pb-5">
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center gap-2 rounded-xl
                     py-2 text-surface-500 hover:text-white hover:bg-white/[0.04]
                     transition-all duration-200 cursor-pointer text-xs"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
