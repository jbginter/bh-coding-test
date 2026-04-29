export interface Player {
  player_id: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  status?: string;
  team?: string;
  age?: number;
  height?: string;
  weight?: string;
  college?: string;
  years_exp?: number;
  number?: number;
  injury_status?: string;
  sport?: string;
  search_rank?: number;
  depth_chart_position?: string;
  depth_chart_order?: number;
}

export interface PlayersResponse {
  data: Player[];
  total: number;
  page: number;
  limit: number;
}

export interface PlayerQueryParams {
  page?: number;
  limit?: number;
  sort?: 'last_name' | 'first_name' | 'position' | 'status' | 'team';
  order?: 'asc' | 'desc';
  position?: string;
  team?: string;
  status?: string;
  q?: string;
  first_name?: string;
}