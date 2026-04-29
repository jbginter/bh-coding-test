import { Router, Request, Response } from 'express';
import type { Player, PlayersResponse, PlayerQueryParams } from '@shared/types';
import * as cache from '../cache';

const SLEEPER_URL = 'https://api.sleeper.app/v1/players/nfl';
const CACHE_KEY = 'nfl_players';

const NFL_TEAM_NAMES = new Set([
  'Cardinals', 'Falcons', 'Ravens', 'Bills', 'Panthers', 'Bears', 'Bengals',
  'Browns', 'Cowboys', 'Broncos', 'Lions', 'Packers', 'Texans', 'Colts',
  'Jaguars', 'Chiefs', 'Raiders', 'Chargers', 'Rams', 'Dolphins', 'Vikings',
  'Patriots', 'Saints', 'Giants', 'Jets', 'Eagles', 'Steelers', '49ers',
  'Seahawks', 'Buccaneers', 'Titans', 'Commanders',
]);

export async function fetchPlayers(): Promise<Player[]> {
  const cached = cache.get<Player[]>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(SLEEPER_URL);
  if (!res.ok) throw new Error(`Sleeper API error: ${res.status}`);

  const raw = (await res.json()) as Record<string, unknown>;
  const players = Object.values(raw)
    .filter((p): p is Record<string, unknown> => typeof p === 'object' && p !== null && 'player_id' in p)
    .map((p) => p as unknown as Player)
    .filter((p) => !NFL_TEAM_NAMES.has(p.last_name ?? ''))
    .filter((p) => {
      const first = (p.first_name ?? '').toLowerCase();
      const last = (p.last_name ?? '').toLowerCase();
      if (!first && !last) return false;
      if (first.includes('invalid') || last.includes('invalid')) return false;
      return true;
    });

  cache.set(CACHE_KEY, players);
  return players;
}

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
  if (params.first_name) {
    const fn = params.first_name.toLowerCase();
    result = result.filter((p) => (p.first_name ?? '').toLowerCase().includes(fn));
  }

  return result;
}

export function sortPlayers(players: Player[], sort?: PlayerQueryParams['sort'], order: PlayerQueryParams['order'] = 'asc'): Player[] {
  if (!sort) return players;

  const dir = order === 'desc' ? -1 : 1;

  return [...players].sort((a, b) => {
    const av = (a[sort] ?? '') as string;
    const bv = (b[sort] ?? '') as string;
    // nulls/empty strings sort last regardless of direction
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

const router = Router();

router.get('/meta', async (_req: Request, res: Response) => {
  try {
    const players = await fetchPlayers();
    const positions = [...new Set(players.map((p) => p.position).filter(Boolean))].sort() as string[];
    const teams = [...new Set(players.map((p) => p.team).filter(Boolean))].sort() as string[];
    const statuses = [...new Set(players.map((p) => p.status).filter(Boolean))].sort() as string[];
    res.json({ positions, teams, statuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch meta' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const params: PlayerQueryParams = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 25,
      sort: req.query.sort as PlayerQueryParams['sort'],
      order: (req.query.order as PlayerQueryParams['order']) ?? 'asc',
      position: req.query.position as string | undefined,
      team: req.query.team as string | undefined,
      status: req.query.status as string | undefined,
      q: req.query.q as string | undefined,
      first_name: req.query.first_name as string | undefined,
    };

    const players = await fetchPlayers();
    const filtered = filterPlayers(players, params);
    const sorted = sortPlayers(filtered, params.sort, params.order);
    const response = paginatePlayers(sorted, params.page, params.limit);

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

export default router;
