import { Router, Request, Response } from 'express';
import type { PlayerQueryParams } from '@shared/types';
import { fetchPlayers } from '../services/sleeperService';
import { filterPlayers, sortPlayers, paginatePlayers } from '../utils/playerFilters';

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
