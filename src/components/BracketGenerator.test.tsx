import * as assert from 'assert';
import { makeFinals } from './BracketGenerator';
import { loserOf, makeGame } from '../testing/games';
import { Game } from './model';

const summarize = (games: Game[]) => makeFinals({ games }).map(({ game, height }) => [ game.id, height ]);

describe('makeFinals', () => {
  const q1 = makeGame('q1'), q2 = makeGame('q2'), q3 = makeGame('q3'), q4 = makeGame('q4');
  const s1 = makeGame('s1', q1, q2), s2 = makeGame('s2', q3, q4);
  const final = makeGame('final', s1, s2);

  it('finds the single final of a bracket when the final is listed first', () => {
    assert.deepEqual(summarize([ final, s1, s2, q1, q2, q3, q4 ]), [ [ 'final', 3 ] ]);
  });

  it('finds the single final of a bracket when the final is listed last', () => {
    assert.deepEqual(summarize([ q1, q2, q3, q4, s1, s2, final ]), [ [ 'final', 3 ] ]);
  });

  it('treats a game fed only by losers as a separate final, tallest bracket first', () => {
    const thirdPlace: Game = {
      ...makeGame('third-place'),
      sides: { home: loserOf(s1), visitor: loserOf(s2) }
    };

    assert.deepEqual(
      summarize([ thirdPlace, final, s1, s2, q1, q2, q3, q4 ]),
      [ [ 'final', 3 ], [ 'third-place', 1 ] ]
    );
  });

  it('returns every game when none of them feed into each other', () => {
    assert.deepEqual(summarize([ q1, q2 ]), [ [ 'q1', 1 ], [ 'q2', 1 ] ]);
  });

  it('keeps a game as a final when its source game is outside the group', () => {
    assert.deepEqual(summarize([ s1 ]), [ [ 's1', 2 ] ]);
  });
});
