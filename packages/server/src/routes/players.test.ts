import { describe, it, expect } from 'vitest';
import { filterPlayers, sortPlayers, paginatePlayers } from './players';
import type { Player } from '@shared/types';

const players: Player[] = [
  { player_id: '1', first_name: 'Patrick', last_name: 'Mahomes', position: 'QB', status: 'Active', team: 'KC' },
  { player_id: '2', first_name: 'Justin', last_name: 'Jefferson', position: 'WR', status: 'Active', team: 'MIN' },
  { player_id: '3', first_name: 'Josh', last_name: 'Allen', position: 'QB', status: 'Active', team: 'BUF' },
  { player_id: '4', first_name: 'Tyreek', last_name: 'Hill', position: 'WR', status: 'Active', team: 'MIA' },
  { player_id: '5', first_name: 'Lamar', last_name: 'Jackson', position: 'QB', status: 'Inactive', team: 'BAL' },
  { player_id: '6', first_name: 'Cooper', last_name: 'Kupp', position: 'WR', status: 'Inactive', team: 'LAR' },
  { player_id: '7', first_name: 'Davante', last_name: 'Adams', position: 'WR', status: 'Active', team: undefined },
];

describe('filterPlayers', () => {
  it('filters by position', () => {
    const result = filterPlayers(players, { position: 'QB' });
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.position === 'QB')).toBe(true);
  });

  it('filters by team', () => {
    const result = filterPlayers(players, { team: 'KC' });
    expect(result).toHaveLength(1);
    expect(result[0].player_id).toBe('1');
  });

  it('filters by status', () => {
    const result = filterPlayers(players, { status: 'Inactive' });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.status === 'Inactive')).toBe(true);
  });

  it('searches by partial last name (case-insensitive)', () => {
    const result = filterPlayers(players, { q: 'all' });
    expect(result).toHaveLength(1); // only Allen contains 'all'
    expect(result[0].player_id).toBe('3');
  });

  it('searches by partial first name', () => {
    const result = filterPlayers(players, { q: 'pat' });
    expect(result).toHaveLength(1);
    expect(result[0].player_id).toBe('1');
  });

  it('combines position and status filters', () => {
    const result = filterPlayers(players, { position: 'WR', status: 'Active' });
    expect(result).toHaveLength(3); // Jefferson, Hill, Adams
    const ids = result.map((p) => p.player_id);
    expect(ids).toContain('2'); // Jefferson
    expect(ids).toContain('4'); // Hill
    expect(ids).toContain('7'); // Adams (Active WR, no team)
  });

  it('returns empty array when no match', () => {
    const result = filterPlayers(players, { team: 'SEA' });
    expect(result).toHaveLength(0);
  });
});

describe('sortPlayers', () => {
  it('sorts by last_name ascending', () => {
    const result = sortPlayers(players, 'last_name', 'asc');
    const lastNames = result.map((p) => p.last_name);
    expect(lastNames).toEqual([...lastNames].sort());
  });

  it('sorts by last_name descending', () => {
    const result = sortPlayers(players, 'last_name', 'desc');
    const lastNames = result.map((p) => p.last_name);
    expect(lastNames).toEqual([...lastNames].sort((a, b) => (b ?? '').localeCompare(a ?? '')));
  });

  it('sorts nulls last regardless of direction', () => {
    const result = sortPlayers(players, 'team', 'asc');
    expect(result[result.length - 1].team).toBeUndefined();
  });

  it('returns a new array (does not mutate)', () => {
    const original = [...players];
    sortPlayers(players, 'last_name', 'asc');
    expect(players).toEqual(original);
  });

  it('returns original order when no sort field provided', () => {
    const result = sortPlayers(players, undefined);
    expect(result.map((p) => p.player_id)).toEqual(players.map((p) => p.player_id));
  });
});

describe('paginatePlayers', () => {
  it('returns the correct slice for page 1', () => {
    const result = paginatePlayers(players, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.data[0].player_id).toBe('1');
    expect(result.total).toBe(7);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(3);
  });

  it('returns the correct slice for page 2', () => {
    const result = paginatePlayers(players, 2, 3);
    expect(result.data).toHaveLength(3);
    expect(result.data[0].player_id).toBe('4');
  });

  it('returns a partial last page', () => {
    const result = paginatePlayers(players, 3, 3);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].player_id).toBe('7');
  });

  it('returns empty data beyond total pages', () => {
    const result = paginatePlayers(players, 10, 3);
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(7);
  });
});
