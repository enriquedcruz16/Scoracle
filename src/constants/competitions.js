export const COMPETITIONS = {
  wc2026: {
    id: 'wc2026',
    name: 'FIFA World Cup 2026',
    shortName: 'World Cup 2026',
    emoji: '⚽',
    description: '48 teams · 12 groups · 104 matches',
    accentColor: '#f59e0b',
    status: 'active',
    apiLeagueId: 1,
    apiSeason: 2026,
    hasGroups: true,
    hasKnockout: true,
    lockISO: '2026-06-11T14:00:00+01:00',
  },
  pl2526: {
    id: 'pl2526',
    name: 'Premier League 2025/26',
    shortName: 'PL 2025/26',
    emoji: '🦁',
    description: '20 teams · 38 matchdays · 380 matches',
    accentColor: '#a855f7',
    status: 'upcoming',
    apiLeagueId: 39,
    apiSeason: 2025,
    hasGroups: false,
    hasKnockout: false,
    lockISO: '2025-08-16T11:00:00+01:00',
  },
};

export const COMPETITIONS_LIST = Object.values(COMPETITIONS);
