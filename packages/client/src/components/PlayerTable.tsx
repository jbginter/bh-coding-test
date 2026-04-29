import type { Player, SortColumn } from '@shared/types';
import { TEAM_NAMES, POSITION_NAMES } from '../lib/nflConstants';

interface PlayerTableProps {
  players: Player[];
  sort: SortColumn;
  order: 'asc' | 'desc';
  loading: boolean;
  favorites: Set<string>;
  showFavoritesOnly: boolean;
  onSort: (col: SortColumn) => void;
  onRowClick: (player: Player) => void;
  onToggleFavorite: (id: string) => void;
}

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'last_name', label: 'Last Name' },
  { key: 'first_name', label: 'First Name' },
  { key: 'position', label: 'Position' },
  { key: 'status', label: 'Status' },
  { key: 'team', label: 'Team' },
];

export function PlayerTable({
  players,
  sort,
  order,
  loading,
  favorites,
  onSort,
  onRowClick,
  onToggleFavorite,
}: PlayerTableProps) {
  function indicator(col: SortColumn) {
    if (sort !== col || !col) return null;
    return <span className="ml-1 text-brand-200">{order === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white">
      {loading && <div className="loading-bar absolute top-0 left-0 right-0 h-[3px] z-[1]" />}
      <table className="w-full border-collapse text-sm">
        <thead className="bg-brand-900 border-b border-brand-800">
          <tr>
            <th className="w-10 px-3 py-3" />
            {COLUMNS.map(({ key, label }) => (
              <th
                key={label}
                className={`px-4 py-3 text-left font-semibold text-brand-100 text-xs uppercase tracking-wide whitespace-nowrap${
                  key ? ' cursor-pointer select-none hover:text-white' : ''
                }`}
                onClick={key ? () => onSort(key) : undefined}
              >
                {label}
                {indicator(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.length === 0 && !loading ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-gray-400">
                No players found.
              </td>
            </tr>
          ) : (
            players.map((p) => (
              <tr
                key={p.player_id}
                className="cursor-pointer transition-colors hover:bg-brand-50 [&:last-child_td]:border-b-0"
                onClick={() => onRowClick(p)}
              >
                <td
                  className="text-center text-lg text-amber-500 px-2 py-3 border-b border-gray-100"
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.player_id); }}
                >
                  <span className="inline-block hover:scale-110 transition-transform cursor-pointer">
                    {favorites.has(p.player_id) ? '★' : '☆'}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-gray-900 whitespace-nowrap">{p.last_name ?? '—'}</td>
                <td className="px-4 py-3 border-b border-gray-100 text-gray-900 whitespace-nowrap">{p.first_name ?? '—'}</td>
                <td className="px-4 py-3 border-b border-gray-100 text-gray-900 whitespace-nowrap">
                  {p.position ? (POSITION_NAMES[p.position] ? `${POSITION_NAMES[p.position]} (${p.position})` : p.position) : '—'}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-[2px] rounded-full text-xs font-medium ${
                      p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.status ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-gray-900 whitespace-nowrap">{p.team ? (TEAM_NAMES[p.team] ?? p.team) : 'Free Agent'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
