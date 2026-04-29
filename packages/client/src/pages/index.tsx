import { useState, useCallback } from 'react';
import type { Player, PlayerQueryParams } from '@shared/types';
import { usePlayers } from '../hooks/usePlayers';
import { useMeta } from '../hooks/useMeta';
import { useFavorites } from '../hooks/useFavorites';
import { Filters } from '../components/Filters';
import { PlayerTable } from '../components/PlayerTable';
import { Pagination } from '../components/Pagination';
import { PlayerModal } from '../components/PlayerModal';

const LIMIT = 25;

type SortCol = PlayerQueryParams['sort'];

interface FilterState {
  q: string;
  position: string;
  team: string;
  status: string;
}

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({ q: '', position: '', team: '', status: '' });
  const [sort, setSort] = useState<SortCol>('last_name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggle: toggleFavorite } = useFavorites();

  const meta = useMeta();
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

  const handleSort = useCallback((col: SortCol) => {
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
        <h1 className="text-2xl font-bold text-[#2c3e50]">NFL Players</h1>
        <button
          className={`px-4 py-2 border rounded-md text-sm cursor-pointer transition-colors whitespace-nowrap ${
            showFavoritesOnly
              ? 'border-amber-400 bg-yellow-100 text-amber-800 font-semibold'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-yellow-50 hover:border-amber-400'
          }`}
          onClick={() => setShowFavoritesOnly((v) => !v)}
        >
          {showFavoritesOnly ? '★ Favorites' : '☆ Show Favorites'}
        </button>
      </header>

      <div className="mb-6">
        <Filters values={filters} options={meta} onChange={handleFilterChange} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm">
          ⚠ {error}
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
