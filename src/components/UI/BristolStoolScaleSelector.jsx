import React from 'react';

const BRISTOL_SCALE = [
  {
    value: 1,
    group: 'red',
    description: 'Separate hard lumps, like nuts',
    path: 'M4.5 10.8c0-2 1.4-3.4 3.2-3.4 1.3 0 2.2.6 2.8 1.6.6 1 .7 2.1.2 3.1-.6 1.1-1.7 1.8-3 1.8-1.7 0-3.2-1.1-3.2-3.1Z',
  },
  {
    value: 2,
    group: 'red',
    description: 'Sausage-shaped but lumpy',
    path: 'M3.8 10.7c0-2.2 1.8-3.9 4.2-3.9 2.2 0 3.5.9 4.2 2.1.6 1 .7 2 .3 3-.6 1.5-2.1 2.5-4.1 2.5-2.4 0-4.6-1.3-4.6-3.7Z',
  },
  {
    value: 3,
    group: 'green',
    description: 'Like a sausage with cracks on the surface',
    path: 'M3 10.5c0-2.3 2.1-4.1 4.8-4.1h6.1c2.7 0 4.8 1.8 4.8 4.1 0 2.2-2.1 4-4.8 4H7.8C5.1 14.5 3 12.7 3 10.5Z',
  },
  {
    value: 4,
    group: 'green',
    description: 'Like a sausage, smooth and soft',
    path: 'M2.8 10.5c0-2.5 2.2-4.5 5-4.5h8.4c2.8 0 5 2 5 4.5s-2.2 4.5-5 4.5H7.8c-2.8 0-5-2-5-4.5Z',
  },
  {
    value: 5,
    group: 'yellow',
    description: 'Soft blobs with clear-cut edges',
    path: 'M4 10.7c0-1.8 1.2-3.1 3.3-3.1 1.3 0 2.2.4 3 1.1.8.7 1.7 1.1 2.9 1.1 1.1 0 2.2-.4 3.3-1.1 1-.7 2.1-1.1 3.3-1.1 1.5 0 2.7 1 2.7 2.8 0 2.2-1.6 4-4 4H8c-2.2 0-4-1.3-4-3.7Z',
  },
  {
    value: 6,
    group: 'yellow',
    description: 'Fluffy pieces with ragged edges',
    path: 'M3.5 10.5c0-1.7 1.2-2.8 2.6-2.8 1.1 0 1.8.5 2.4 1.1.6.6 1.2 1 2.1 1 .8 0 1.4-.3 2-.9.7-.7 1.6-1.2 2.7-1.2 1.7 0 3 1.2 3 2.9 0 2.6-1.8 4.2-4.5 4.2H7.9c-2.5 0-4.4-1.4-4.4-4.3Z',
  },
  {
    value: 7,
    group: 'yellow',
    description: 'Watery, no solid pieces',
    path: 'M4 10.2c0-1.4 1-2.4 2.3-2.4 1 0 1.6.4 2 .9.5.6 1.1 1.1 2.1 1.1.8 0 1.4-.3 2-.8.6-.6 1.4-1.1 2.5-1.1 1.4 0 2.6 1 2.6 2.5 0 2.8-2.4 4.4-5.6 4.4H8.7C6 14.8 4 13.2 4 10.2Z',
  },
];

const groupInlineStyles = {
  red: {
    backgroundColor: '#fff1f2',
    borderColor: '#fda4af',
    color: '#9f1239',
  },
  green: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    color: '#166534',
  },
  yellow: {
    backgroundColor: '#fefce8',
    borderColor: '#fcd34d',
    color: '#92400e',
  },
};

const groupAccentStyles = {
  red: {
    color: '#fb7185',
  },
  green: {
    color: '#4ade80',
  },
  yellow: {
    color: '#f59e0b',
  },
};

const baseButtonStyles =
  'flex-1 min-w-0 rounded-lg border px-1 text-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2';
const inactiveStyles = 'bg-white border-slate-200 text-slate-700';

const BristolStoolScaleSelector = ({ value, onChange, className = '' }) => {
  const selectedStep = BRISTOL_SCALE.find((step) => step.value === value);

  return (
    <div
      className={`w-full ${className}`.trim()}
      style={{ width: '100%' }}
    >
      <div
        className="flex w-full gap-2"
        style={{ display: 'flex', width: '100%', gap: '0.5rem' }}
      >
        {BRISTOL_SCALE.map((step) => {
          const active = value === step.value;
          const inlineStyle = active ? groupInlineStyles[step.group] : {
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
            color: groupAccentStyles[step.group].color,
          };

          return (
            <button
              key={step.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange?.(step.value)}
              className={baseButtonStyles}
              style={{
                ...inlineStyle,
                flex: '1 1 0%',
                minWidth: 0,
                minHeight: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderStyle: 'solid',
                padding: '0.25rem 0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: active ? '0 1px 2px rgba(15, 23, 42, 0.05)' : 'none',
              }}
            >
              <div
                className="flex h-full min-w-0 flex-col items-center justify-center gap-0.5"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.1rem' }}
              >
                <span className="text-[11px] font-semibold leading-none" style={{ fontSize: '0.66rem', lineHeight: 1 }}>
                  {step.value}
                </span>
                <svg
                  viewBox="0 0 24 16"
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{ width: 14, height: 14, flexShrink: 0, color: active ? inlineStyle.color : groupAccentStyles[step.group].color }}
                  fill="none"
                  aria-hidden="true"
                >
                  <path d={step.path} fill="currentColor" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <p
        className="mt-2 truncate text-xs leading-5 text-slate-500"
        style={{ marginTop: '0.375rem', fontSize: '0.72rem', lineHeight: '1.1rem', color: '#64748b' }}
      >
        {selectedStep ? `Type ${selectedStep.value}: ${selectedStep.description}` : 'Select a stool type'}
      </p>
    </div>
  );
};

export default BristolStoolScaleSelector;
