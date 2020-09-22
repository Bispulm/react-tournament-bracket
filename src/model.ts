export enum Side {
  HOME = 'home',
  VISITOR = 'visitor'
}

export type ID = string;

export interface SideInfo {
  score?: {
    score: number;
  };

  seed?: {
    displayName: string;
    rank: number;
    // the game this side comes from, if it isn't seeded directly into the game
    sourceGame?: Game | null;
    sourcePool?: object | null;
  };

  team?: {
    id: ID;
    name: string;
  }
}

export interface Game {
  id: ID;
  // the game name
  name: string;
  // optional: the label for the game within the bracket, e.g. Gold Finals, Silver Semi-Finals
  bracketLabel?: string;
  // when the game is scheduled, in milliseconds since the Unix epoch
  scheduled: number;

  court?: {
    name: string;
    venue: {
      name: string
    }
  };

  sides: {
    [side in Side]: SideInfo
  };
}
