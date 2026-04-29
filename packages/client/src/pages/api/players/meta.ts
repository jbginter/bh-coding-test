import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchPlayers } from '../../../lib/sleeperService';

interface MetaResponse {
  positions: string[];
  teams: string[];
  statuses: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetaResponse | { error: string }>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const players = await fetchPlayers();
    const positions = Array.from(new Set(players.map((p) => p.position).filter(Boolean))).sort() as string[];
    const teams = Array.from(new Set(players.map((p) => p.team).filter(Boolean))).sort() as string[];
    const statuses = Array.from(new Set(players.map((p) => p.status).filter(Boolean))).sort() as string[];
    res.json({ positions, teams, statuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch meta' });
  }
}
