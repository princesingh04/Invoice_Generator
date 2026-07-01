import { useEffect, useRef, useState } from 'react';

/**
 * StatsCard — glassmorphism metric card with animated counter.
 *
 * @param {{ icon: React.ElementType, label: string, value: number|string, prefix?: string, delay?: number, gradient?: string }} props
 */
export default function StatsCard({
  icon: Icon,
  label,
  value,
  prefix = '',
  delay = 0,
  gradient = 'from-indigo-500 to-violet-500',
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  // Animate the number from 0 → value on mount
  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (numericValue === 0) { setDisplay(0); return; }

    let start = 0;
    const duration = 900; // ms
    const step = (ts) => {
      if (!ref.current) ref.current = ts;
      const progress = Math.min((ts - ref.current) / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      start = Math.floor(eased * numericValue);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div
      className="glass-card p-5 animate-slide-up relative overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient glow behind the icon */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl
                    bg-gradient-to-br ${gradient} group-hover:opacity-30 transition-opacity duration-500`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {prefix}{typeof value === 'number' ? display.toLocaleString() : value}
          </p>
        </div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl
                      bg-gradient-to-br ${gradient} shadow-lg`}
        >
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
