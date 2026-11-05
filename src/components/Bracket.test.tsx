import * as assert from 'assert';
import * as React from 'react';
import { create } from 'react-test-renderer';
import Bracket from './Bracket';
import { Game } from '../model';
import { makeGame } from '../testing/games';

const renderedGames = (game: Game) => {
  const seen: string[] = [];
  const GameComponent = ({ game: { id } }: { game: Game }) => {
    seen.push(id);
    return <g/>;
  };

  create(<Bracket game={game} GameComponent={GameComponent}/>);

  return seen;
};

describe('Bracket', () => {
  it('renders the final and every game that feeds into it', () => {
    const final = makeGame('final', makeGame('s1', makeGame('q1')), makeGame('s2'));

    assert.deepEqual(renderedGames(final).sort(), [ 'final', 'q1', 's1', 's2' ]);
  });

  it('renders a side seeded directly into the game, with no source game', () => {
    const game: Game = {
      ...makeGame('final'),
      sides: {
        home: { seed: { displayName: 'First seed', rank: 1 } },
        visitor: { team: { id: 'team', name: 'Team' } }
      }
    };

    assert.deepEqual(renderedGames(game), [ 'final' ]);
  });

  it('does not follow a side seeded with a null source game', () => {
    const game: Game = {
      ...makeGame('final'),
      sides: {
        home: { seed: { displayName: 'First seed', rank: 1, sourceGame: null } },
        visitor: {}
      }
    };

    assert.deepEqual(renderedGames(game), [ 'final' ]);
  });
});
