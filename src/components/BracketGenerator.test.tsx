import * as assert from 'assert';
import * as React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import Bracket from './Bracket';
import BracketGenerator, { makeFinals } from './BracketGenerator';
import { loserOf, makeGame } from '../testing/games';
import { Game } from '../model';

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

describe('BracketGenerator', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;

  before(() => {
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  after(() => {
    console.warn = originalWarn;
  });

  const titles = (tree: ReactTestRenderer) => tree.root.findAllByType('h3').map(({ children }) => children.join(''));
  const s1 = makeGame('s1', makeGame('q1'), makeGame('q2'));
  const final = makeGame('final', s1, makeGame('s2'));

  it('renders one titled bracket for each final', () => {
    const tree = create(<BracketGenerator games={[ final, s1 ]}/>);

    assert.deepEqual(titles(tree), [ 'final (3 rounds)' ]);
    assert.equal(tree.root.findAllByType(Bracket).length, 1);
  });

  it('uses the singular for a bracket of one round', () => {
    assert.deepEqual(titles(create(<BracketGenerator games={[ makeGame('only') ]}/>)), [ 'only (1 round)' ]);
  });

  it('updates the brackets when the games change', () => {
    const tree = create(<BracketGenerator games={[ final, s1 ]}/>);

    tree.update(<BracketGenerator games={[ makeGame('other') ]}/>);

    assert.deepEqual(titles(tree), [ 'other (1 round)' ]);
  });

  // React warns only the first time it renders a component, so this relies on the spy watching the whole suite
  it('does not use lifecycle methods that React warns about', () => {
    create(<BracketGenerator games={[ final ]}/>);

    assert.deepEqual(warnings, []);
  });
});
