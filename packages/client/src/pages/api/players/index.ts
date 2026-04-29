import type { NextApiRequest, NextApiResponse } from 'next';
import type { PlayerQueryParams, PlayersResponse } from '@shared/types';
import { fetchPlayers } from '../../../lib/sleeperService';
import { filterPlayers, sortPlayers, paginatePlayers } from '../../../lib/playerFilters';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PlayersResponse | { error: string }>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
