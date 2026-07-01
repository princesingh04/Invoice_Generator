/**
 * StatusBadge — colour-coded pill badge for invoice statuses.
 * Includes a subtle matching glow.
 */

const STATUS_MAP = {
  Paid: {
    bg: 'rgba(16,185,129,0.12)',
    text: '#34d399',
    glow: '0 0 8px rgba(16,185,129,0.25)',
    border: 'rgba(16,185,129,0.2)',
  },
  Pending: {
    bg: 'rgba(245,158,11,0.12)',
    text: '#fbbf24',
    glow: '0 0 8px rgba(245,158,11,0.25)',
    border: 'rgba(245,158,11,0.2)',
  },
  Overdue: {
    bg: 'rgba(244,63,94,0.12)',
    text: '#fb7185',
    glow: '0 0 8px rgba(244,63,94,0.25)',
    border: 'rgba(244,63,94,0.2)',
  },
  Draft: {
    bg: 'rgba(56,189,248,0.12)',
    text: '#7dd3fc',
    glow: '0 0 8px rgba(56,189,248,0.25)',
    border: 'rgba(56,189,248,0.2)',
  },
  'Partially Paid': {
    bg: 'rgba(167,139,250,0.12)',
    text: '#c4b5fd',
    glow: '0 0 8px rgba(167,139,250,0.25)',
    border: 'rgba(167,139,250,0.2)',
  },
};

export default function StatusBadge({ status }) {
  const style = STATUS_MAP[status] || STATUS_MAP.Draft;

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{
        background: style.bg,
        color: style.text,
        boxShadow: style.glow,
        border: `1px solid ${style.border}`,
      }}
    >
      {status}
    </span>
  );
}
