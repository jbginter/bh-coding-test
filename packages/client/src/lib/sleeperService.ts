import type { Player } from '@shared/types';
import * as cache from './serverCache';

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
