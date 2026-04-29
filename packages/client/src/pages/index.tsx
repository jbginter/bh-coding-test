import { useState, useCallback } from 'react';
import type { Player, SortColumn } from '@shared/types';
import { usePlayers, useMeta, useFavorites, useTheme } from '../hooks';
import { Filters, PlayerTable, Pagination, PlayerModal } from '../components';

const LIMIT = 25;

interface FilterState {
  q: string;
  position: string;
  team: string;
  status: string;
}

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({ q: '', position: '', team: '', status: '' });
  const [sort, setSort] = useState<SortColumn>('last_name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { dark, toggle: toggleDark } = useTheme();

  const { error: metaError, ...meta } = useMeta();
  const { players, total, loading, error } = usePlayers({
    page,
    limit: LIMIT,
    sort,
    order,
    position: filters.position || undefined,
    team: filters.team || undefined,
    status: filters.status || undefined,
    q: filters.q || undefined,
  });

  const visiblePlayers = showFavoritesOnly ? players.filter((p) => favorites.has(p.player_id)) : players;

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleSort = useCallback((col: SortColumn) => {
    if (!col) return;
    if (sort === col) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(col);
      setOrder('asc');
    }
    setPage(1);
  }, [sort]);

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#2c3e50] dark:text-blue-200">NFL Players</h1>
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 border rounded-md text-sm cursor-pointer transition-colors whitespace-nowrap ${
              showFavoritesOnly
                ? 'border-amber-400 bg-yellow-100 text-amber-800 font-semibold dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-yellow-50 hover:border-amber-400 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-yellow-900/20 dark:hover:border-yellow-600'
            }`}
            onClick={() => setShowFavoritesOnly((v) => !v)}
          >
            {showFavoritesOnly ? '★ Favorites' : '☆ Show Favorites'}
          </button>
          <button
            className="px-3 py-2 border rounded-md text-sm cursor-pointer transition-colors border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
          >
            {dark ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
      </header>

      <div className="mb-6">
        <Filters values={filters} options={meta} onChange={handleFilterChange} />
      </div>

      {(error || metaError) && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm">
          ⚠ {error ?? metaError}
        </div>
      )}

      <PlayerTable
        players={visiblePlayers}
        sort={sort}
        order={order}
        loading={loading}
        favorites={favorites}
        showFavoritesOnly={showFavoritesOnly}
        onSort={handleSort}
        onRowClick={setSelectedPlayer}
        onToggleFavorite={toggleFavorite}
      />

      <Pagination
        page={page}
        total={showFavoritesOnly ? visiblePlayers.length : total}
        limit={LIMIT}
        onPageChange={setPage}
      />

      <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
