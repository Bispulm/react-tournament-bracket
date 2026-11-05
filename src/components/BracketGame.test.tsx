import * as assert from 'assert';
import * as React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import BracketGame from './BracketGame';
import { Game } from './model';
import { makeGame } from '../testing/games';

const game: Game = {
  ...makeGame('final'),
  sides: {
    home: { team: { id: 'home-team', name: 'Home' }, score: { score: 2 } },
    visitor: { team: { id: 'visitor-team', name: 'Visitor' }, score: { score: 1 } }
  }
};

const noop = (): void => undefined;
const render = (hoveredTeamId: string | null) => (
  <BracketGame game={game} hoveredTeamId={hoveredTeamId} onHoveredTeamIdChange={noop}/>
);

// each mounted team row clips its name with a clipPath given a unique id when it mounts
const clipPathIds = (tree: ReactTestRenderer) => tree.root.findAllByType('clipPath').map(({ props: { id } }) => id);

describe('BracketGame', () => {
  it('keeps the team rows mounted when the hovered team changes', () => {
    const tree = create(render(null));
    const idsBefore = clipPathIds(tree);

    tree.update(render('home-team'));

    assert.equal(idsBefore.length, 2);
    assert.deepEqual(clipPathIds(tree), idsBefore);
  });

  it('reports the team under the mouse and clears it on leave', () => {
    const changes: Array<string | null> = [];
    const tree = create(
      <BracketGame game={game} hoveredTeamId={null} onHoveredTeamIdChange={(id: string | null) => changes.push(id)}/>
    );

    const homeRow = tree.root.findAll(({ type, props }) => type === 'g' && !!props.onMouseEnter)[ 0 ];
    homeRow.props.onMouseEnter();
    homeRow.props.onMouseLeave();

    assert.deepEqual(changes, [ 'home-team', null ]);
  });

  it('highlights only the hovered team', () => {
    const tree = create(render('visitor-team'));
    const fills = tree.root.findAll(({ type, props }) => type === 'rect' && props.height === '22.5' && !!props.fill)
      .map(({ props: { fill } }) => fill);

    assert.deepEqual(fills, [ '#58595e', '#222' ]);
  });
});
