import type { Player, PlayersResponse, PlayerQueryParams } from '@shared/types';

export function filterPlayers(players: Player[], params: PlayerQueryParams): Player[] {
  let result = players;

  if (params.position) {
    result = result.filter((p) => p.position === params.position);
  }
  if (params.team) {
    result = params.team === 'FA'
      ? result.filter((p) => !p.team)
      : result.filter((p) => p.team === params.team);
  }
  if (params.status) {
    result = result.filter((p) => p.status === params.status);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter((p) => {
      const full = `${p.first_name ?? ''} ${p.last_name ?? ''}`.toLowerCase();
      return full.includes(q);
    });
  }

  return result;
}

export function sortPlayers(
  players: Player[],
  sort?: PlayerQueryParams['sort'],
  order: PlayerQueryParams['order'] = 'asc',
): Player[] {
  if (!sort) return players;

  const dir = order === 'desc' ? -1 : 1;

  return [...players].sort((a, b) => {
    const av = (a[sort] ?? '') as string;
    const bv = (b[sort] ?? '') as string;
    if (!av && bv) return 1;
    if (av && !bv) return -1;
    if (!av && !bv) return 0;
    return av.localeCompare(bv) * dir;
  });
}

export function paginatePlayers(players: Player[], page = 1, limit = 25): PlayersResponse {
  const total = players.length;
  const start = (page - 1) * limit;
  const data = players.slice(start, start + limit);
  return { data, total, page, limit };
}
