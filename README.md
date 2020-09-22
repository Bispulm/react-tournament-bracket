# react-tournament-bracket

[![CI](https://github.com/Bispulm/react-tournament-bracket/actions/workflows/ci.yml/badge.svg)](https://github.com/Bispulm/react-tournament-bracket/actions/workflows/ci.yml)

React components for rendering a tournament bracket as SVG.

![Example bracket](https://i.imgur.com/M3nJsRF.png "Example bracket")

## About this fork

This is a fork of [moodysalem/react-tournament-bracket](https://github.com/moodysalem/react-tournament-bracket) by
Moody Salem, which has since been archived. The `react-tournament-bracket` package on npm comes from the original and
doesn't include these changes:

- `BracketGenerator` draws one bracket per final. It used to draw a separate bracket for nearly every game.
- A side seeded directly into a game, with no source game, no longer crashes `Bracket`.
- The highlight follows the mouse reliably, and no longer stays on the wrong team after the mouse leaves.
- The package works in Vite apps. It used to crash on load because a dependency expected Node's `global`.
- React no longer logs a deprecation warning for `BracketGenerator`.

## Install

```
npm install github:Bispulm/react-tournament-bracket
```

The package builds itself when installed from git. It needs React 16.3 or later, and has been tested on React 16.14,
18.3, and 19.3.

## Usage

Pass `Bracket` the final game. Each game links to the games that feed into it, so the final alone describes the whole
bracket.

```jsx
import { Bracket } from 'react-tournament-bracket';

const semifinal = {
  id: 'semifinal',
  name: 'Semifinal',
  scheduled: Date.UTC(2026, 5, 1),
  sides: {
    home: { team: { id: 'a', name: 'Team A' }, score: { score: 3 } },
    visitor: { team: { id: 'b', name: 'Team B' }, score: { score: 1 } }
  }
};

const final = {
  id: 'final',
  name: 'Final',
  scheduled: Date.UTC(2026, 5, 8),
  sides: {
    home: { seed: { displayName: 'Winner of Semifinal', rank: 1, sourceGame: semifinal } },
    visitor: { team: { id: 'c', name: 'Team C' } }
  }
};

export const App = () => <Bracket game={final}/>;
```

If you have a list of games rather than a final, use `BracketGenerator`, which finds the finals for you.

### The game model

```ts
interface Game {
  id: string;
  name: string;
  bracketLabel?: string;    // for example 'Gold Finals'
  scheduled: number;        // milliseconds since the Unix epoch
  court?: { name: string; venue: { name: string } };
  sides: { home: SideInfo; visitor: SideInfo };
}

interface SideInfo {
  team?: { id: string; name: string };
  score?: { score: number };
  seed?: {
    displayName: string;    // shown until the team is known
    rank: number;           // the finishing position that sends a team here, where 1 means the winner
    sourceGame?: Game | null;
    sourcePool?: object | null;
  };
}
```

Only `rank: 1` seeds are followed when drawing a bracket. A third-place game seeded with the semifinal losers
(`rank: 2`) therefore becomes its own bracket rather than joining the main one.

TypeScript users can import these types through the `Model` export.

## Components

### `Bracket`

Draws the bracket that ends in one game.

| Prop                  | Default                                              | Description                                 |
|-----------------------|------------------------------------------------------|---------------------------------------------|
| `game`                | Required                                             | The final game                              |
| `GameComponent`       | `BracketGame`                                        | The component that draws each game          |
| `homeOnTop`           | `true`                                               | Whether the home team is on the top row     |
| `gameDimensions`      | `{ height: 80, width: 200 }`                         | The size of each game                       |
| `svgPadding`          | `20`                                                 | Padding around the bracket                  |
| `roundSeparatorWidth` | `24`                                                 | The horizontal gap between rounds           |
| `lineInfo`            | `{ yOffset: -6, separation: 6, homeVisitorSpread: 11 }` | The placement of the connecting lines    |

Any other props are passed to `GameComponent`.

### `BracketGenerator`

Draws a titled `Bracket` for each final in a list of games, tallest first. A final is any game whose winner doesn't
advance to another game in the list.

| Prop             | Default        | Description                                             |
|------------------|----------------|---------------------------------------------------------|
| `games`          | Required       | The games to draw                                       |
| `titleComponent` | `BracketTitle` | The title for each bracket, given `game` and `height`   |
| `style`          | None           | Styles for the outer `div`                              |

It also accepts every `Bracket` prop other than `game`.

### `BracketGame`

Draws one game.

| Prop                    | Default       | Description                                                       |
|-------------------------|---------------|-------------------------------------------------------------------|
| `game`                  | Required      | The game to draw                                                  |
| `homeOnTop`             | `true`        | Whether the home team is on the top row                           |
| `hoveredTeamId`         | None          | The highlighted team, where `null` means none                     |
| `defaultHoveredTeamId`  | `null`        | The starting highlight when `hoveredTeamId` isn't passed          |
| `onHoveredTeamIdChange` | None          | Called with the team under the mouse, or `null` when it leaves    |
| `styles`                | Built-in      | Colors and text styles. This replaces the defaults, so set every key |
| `topText`               | Date          | Given the game, returns the text above it                         |
| `bottomText`            | Name          | Given the game, returns the text below it                         |

Any other props, such as `onClick`, are passed to the `svg` element.

By default, each game tracks the mouse by itself, so a team only highlights in the game under the cursor. To highlight a
team everywhere it appears, pass `hoveredTeamId` from shared state, as `demo/src/App.tsx` does.

## Known limitations

- `BracketGame` draws on a fixed 200 by 82 grid. Its `width` and `height` scale the drawing rather than rearranging it.

## Development

```
npm ci
npm test
npm run build
```

To run the demo, see [demo/README.md](demo/README.md). It builds against the source in this repository.

```
├── src/
│   ├── components/    The three public components, and the clip path they share
│   ├── testing/       Fixtures for the tests
│   ├── util/          Bracket calculations
│   ├── model.ts       The game model
│   └── index.ts       Public exports
└── demo/              Sample app, built against src/
```

Tests sit next to the code they cover.

## License

[MIT](LICENSE). Copyright belongs to Moody Salem, the original author.
