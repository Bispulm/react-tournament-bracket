import * as assert from 'assert';
import * as React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import BracketGame from './BracketGame';
import { Game } from '../model';
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

  describe('hover state', () => {
    const rows = (tree: ReactTestRenderer) => tree.root.findAll(({ type, props }) => type === 'g' && !!props.onMouseEnter);
    const litRows = (tree: ReactTestRenderer) => (
      tree.root.findAll(({ type, props }) => type === 'rect' && props.height === '22.5' && !!props.fill)
        .map(({ props: { fill } }) => fill === '#222')
    );

    it('tracks the hovered team itself when hoveredTeamId is not passed', () => {
      const tree = create(<BracketGame game={game}/>);
      assert.deepEqual(litRows(tree), [ false, false ]);

      rows(tree)[ 1 ].props.onMouseEnter();
      assert.deepEqual(litRows(tree), [ false, true ]);

      rows(tree)[ 1 ].props.onMouseLeave();
      assert.deepEqual(litRows(tree), [ false, false ]);
    });

    it('still reports changes when it tracks the hovered team itself', () => {
      const changes: Array<string | null> = [];
      const tree = create(<BracketGame game={game} onHoveredTeamIdChange={(id: string | null) => changes.push(id)}/>);

      rows(tree)[ 0 ].props.onMouseEnter();

      assert.deepEqual(changes, [ 'home-team' ]);
      assert.deepEqual(litRows(tree), [ true, false ]);
    });

    it('lets a passed hoveredTeamId win over the mouse', () => {
      const tree = create(<BracketGame game={game} hoveredTeamId="visitor-team"/>);

      rows(tree)[ 0 ].props.onMouseEnter();

      assert.deepEqual(litRows(tree), [ false, true ]);
    });

    it('treats a passed null as no hovered team, not as uncontrolled', () => {
      const tree = create(<BracketGame game={game} hoveredTeamId={null}/>);

      rows(tree)[ 0 ].props.onMouseEnter();

      assert.deepEqual(litRows(tree), [ false, false ]);
    });

    it('starts from defaultHoveredTeamId and can then change', () => {
      const tree = create(<BracketGame game={game} defaultHoveredTeamId="home-team"/>);
      assert.deepEqual(litRows(tree), [ true, false ]);

      rows(tree)[ 1 ].props.onMouseEnter();
      assert.deepEqual(litRows(tree), [ false, true ]);
    });

    it('does not forward its own props to the svg element', () => {
      const { props } = create(<BracketGame game={game} defaultHoveredTeamId="home-team"/>).root.findByType('svg');

      assert.deepEqual(
        [ 'defaultHoveredTeamId', 'hoveredTeamId', 'onHoveredTeamIdChange', 'game' ].filter(name => name in props),
        []
      );
    });

    it('forwards other props to the svg element', () => {
      const onClick = (): void => undefined;
      const { props } = create(<BracketGame game={game} x={10} y={20} onClick={onClick}/>).root.findByType('svg');

      assert.deepEqual([ props.x, props.y, props.onClick ], [ 10, 20, onClick ]);
    });
  });
});
