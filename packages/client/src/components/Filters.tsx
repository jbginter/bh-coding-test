import { TEAM_NAMES, POSITION_NAMES } from '../lib/nflConstants';

interface FilterValues {
  q: string;
  position: string;
  team: string;
  status: string;
}

interface FiltersProps {
  values: FilterValues;
  options: { positions: string[]; teams: string[]; statuses: string[] };
  onChange: (key: keyof FilterValues, value: string) => void;
}

const fieldClass =
  'flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 h-[38px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15';

export function Filters({ values, options, onChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        className={`${fieldClass} basis-[200px] min-w-[200px]`}
        type="search"
        placeholder="Search players..."
        value={values.q}
        onChange={(e) => onChange('q', e.target.value)}
      />
      <select className={fieldClass} value={values.position} onChange={(e) => onChange('position', e.target.value)}>
        <option value="">All Positions</option>
        {options.positions.map((p) => (
          <option key={p} value={p}>{POSITION_NAMES[p] ? `${POSITION_NAMES[p]} (${p})` : p}</option>
        ))}
      </select>
      <select className={fieldClass} value={values.team} onChange={(e) => onChange('team', e.target.value)}>
        <option value="">All Teams</option>
        <option value="FA">Free Agent</option>
        {options.teams.map((t) => (
          <option key={t} value={t}>{TEAM_NAMES[t] ?? t}</option>
        ))}
      </select>
      <select className={fieldClass} value={values.status} onChange={(e) => onChange('status', e.target.value)}>
        <option value="">All Statuses</option>
        {options.statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
