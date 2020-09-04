import { Game, SideInfo } from '../model';

const winnerOf = (sourceGame?: Game): SideInfo => (
  sourceGame ?
    { seed: { displayName: `Winner of ${sourceGame.name}`, rank: 1, sourceGame, sourcePool: null } } :
    {}
);

export const loserOf = (sourceGame: Game): SideInfo => (
  { seed: { displayName: `Loser of ${sourceGame.name}`, rank: 2, sourceGame, sourcePool: null } }
);

/**
 * Builds a game whose sides are filled by the winners of the given games
 */
export const makeGame = (id: string, home?: Game, visitor?: Game): Game => ({
  id,
  name: id,
  scheduled: 0,
  sides: { home: winnerOf(home), visitor: winnerOf(visitor) }
});
