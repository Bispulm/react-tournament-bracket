import * as assert from 'assert';
import { loserOf, makeGame } from '../testing/games';
import { Game } from '../components/model';
import winningPathLength from './winningPathLength';

describe('winningPathLength', () => {
  it('is 1 for a game with no source games', () => {
    assert.equal(winningPathLength(makeGame('only')), 1);
  });

  it('counts every round of a balanced bracket', () => {
    const final = makeGame(
      'final',
      makeGame('s1', makeGame('q1'), makeGame('q2')),
      makeGame('s2', makeGame('q3'), makeGame('q4'))
    );

    assert.equal(winningPathLength(final), 3);
  });

  it('follows the longest path through an uneven bracket', () => {
    const final = makeGame('final', makeGame('bye'), makeGame('s1', makeGame('q1', makeGame('r1'))));

    assert.equal(winningPathLength(final), 4);
  });

  it('does not follow the losers of a source game', () => {
    const thirdPlace: Game = {
      ...makeGame('third-place'),
      sides: { home: loserOf(makeGame('s1', makeGame('q1'))), visitor: {} }
    };

    assert.equal(winningPathLength(thirdPlace), 1);
  });

  it('stops at a game it has already visited', () => {
    const first = makeGame('first'), second = makeGame('second', first);
    first.sides.home = second.sides.home;

    assert.equal(winningPathLength(second), 2);
  });
});
