import { useEffect, useRef } from 'react';
import type { Player } from '@shared/types';

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
}

const DISPLAY_FIELDS: { key: keyof Player; label: string }[] = [
  { key: 'position', label: 'Position' },
  { key: 'status', label: 'Status' },
  { key: 'team', label: 'Team' },
  { key: 'age', label: 'Age' },
  { key: 'number', label: 'Number' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
  { key: 'college', label: 'College' },
  { key: 'years_exp', label: 'Experience (yrs)' },
  { key: 'injury_status', label: 'Injury Status' },
  { key: 'depth_chart_position', label: 'Depth Chart Position' },
  { key: 'depth_chart_order', label: 'Depth Chart Order' },
];

export function PlayerModal({ player, onClose }: PlayerModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!player) return;
    closeRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [player, onClose]);

  if (!player) return null;

  const fields = DISPLAY_FIELDS.filter(({ key }) => {
    const v = player[key];
    return v !== null && v !== undefined && v !== '';
  });

  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-[560px] w-full max-h-[80vh] overflow-y-auto relative shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-player-name"
      >
        <button
          ref={closeRef}
          className="absolute top-4 right-4 bg-transparent border-0 text-lg text-gray-400 cursor-pointer leading-none p-1 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 id="modal-player-name" className="text-[1.35rem] font-bold text-gray-900 dark:text-gray-100 mb-5 pr-8">
          {player.first_name} {player.last_name}
        </h2>
        <dl className="grid grid-cols-1 gap-2">
          {fields.map(({ key, label }) => (
            <div
              key={key}
              className="flex justify-between gap-4 py-[0.4rem] border-b border-gray-100 dark:border-slate-700 last:border-b-0 text-sm"
            >
              <dt className="text-gray-500 dark:text-gray-400 shrink-0">{label}</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium text-right break-words">{String(player[key])}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
