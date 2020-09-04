import * as React from 'react';
import { CSSProperties } from 'react';
import * as _ from 'underscore';
import Bracket, { BracketProps } from './Bracket';
import winningPathLength from '../util/winningPathLength';
import { Game } from '../model';

export const makeFinals = ({ games }: { games: Game[] }): Array<{ game: Game, height: number }> => {
  const gamesFeedInto = _.map(
    games,
    game => ({
      ...game,
      feedsInto: _.filter(
        games,
        ({ sides }) => _.any(
          sides,
          ({ seed }) => seed && seed.sourceGame && seed.rank === 1 && seed.sourceGame.id === game.id
        )
      )
    })
  );

  return _.chain(gamesFeedInto)
  // get the games that don't feed into anything else in the group, i.e. finals for this game group
    .filter(({ feedsInto }) => feedsInto.length === 0)
    .map(
      // get their heights
      game => ({
        game,
        height: winningPathLength(game)
      })
    )
    // render the tallest bracket first
    .sortBy(({ height }) => height * -1)
    .value();
};

/**
 * The default title component used for each bracket, receives the game and the height of the bracket
 */
export class BracketTitle extends React.PureComponent<{ game: Game; height: number; }> {
  render() {
    const { game, height } = this.props;

    return (
      <h3 style={{ textAlign: 'center' }}>
        {game.bracketLabel || game.name} ({height} {height === 1 ? 'round' : 'rounds'})
      </h3>
    );
  }
}

export interface BracketGeneratorProps extends Omit<BracketProps, 'game'> {
  games: Game[];
  titleComponent?: React.ComponentClass<{ game: Game; height: number; }>;
  style?: CSSProperties;
}

interface BracketGeneratorState {
  // the games that finals was last derived from
  games: Game[] | null;
  finals: Array<{ game: Game; height: number; }>;
}

/**
 * Displays the brackets for some set of games sorted by bracket height
 */
export default class BracketGenerator extends React.Component<BracketGeneratorProps, BracketGeneratorState> {
  static defaultProps = {
    titleComponent: BracketTitle
  };

  static getDerivedStateFromProps({ games }: BracketGeneratorProps, state: BracketGeneratorState) {
    return games === state.games ? null : { games, finals: makeFinals({ games }) };
  }

  state: BracketGeneratorState = { games: null, finals: [] };

  render() {
    const { games, titleComponent: TitleComponent, style, ...rest } = this.props;
    const { finals } = this.state;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', ...style }}>
        {
          _.map(
            finals,
            ({ game, height }) => (
              <div key={game.id} style={{ textAlign: 'center', flexGrow: 1, maxWidth: '100%' }}>
                <TitleComponent game={game} height={height}/>
                <div style={{ maxWidth: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <Bracket game={game} {...rest}/>
                </div>
              </div>
            )
          )
        }
      </div>
    );
  }
}