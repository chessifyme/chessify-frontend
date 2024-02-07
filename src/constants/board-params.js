import { getInitalFenUrl } from '../utils/utils';

export const INITIAL_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const INITIAL_FEN_URL = getInitalFenUrl();

export const CLEAR_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

export const INITIAL_PGN_STRING = '*';

export const BOARD_ORIENTATION = 'white';

export const LICHESS_DB_PARAMS = {
  variant: 'standard',
  speeds: [
    'ultraBullet',
    'bullet',
    'blitz',
    'rapid',
    'classical',
    'correspondence',
  ],
  ratings: [
    '400',
    '1000',
    '1200',
    '1400',
    '1600',
    '1800',
    '2000',
    '2200',
    '2500',
  ],
  since: '',
  until: '',
  moves: 12,
  topGames: 4,
  recentGames: 4,
};

export const LICHESS_DB_PLAYER_PARAMS = {
  player: '',
  color: 'white',
  variant: 'standard',
  speeds: [
    'ultraBullet',
    'bullet',
    'blitz',
    'rapid',
    'classical',
    'correspondence',
  ],
  modes: ['casual', 'rated'],
  since: '',
  until: '',
  moves: 12,
  recentGames: 8,
};

export const BOARD_THEME = [
  {
    id: 1,
    src: require('../../public/assets/images/board/boards/blue-marble.thumbnail.jpg'),
    name: 'blue-marble',
  },
  {
    id: 2,
    src: require('../../public/assets/images/board/boards/blue.thumbnail.png'),
    name: 'blue',
  },
  {
    id: 3,
    src: require('../../public/assets/images/board/boards/blue2.thumbnail.jpg'),
    name: 'blue2',
  },
  {
    id: 4,
    src: require('../../public/assets/images/board/boards/canvas2.thumbnail.jpg'),
    name: 'canvas',
  },
  {
    id: 5,
    src: require('../../public/assets/images/board/boards/green-plastic.thumbnail.png'),
    name: 'green-plastic',
  },
  {
    id: 6,
    src: require('../../public/assets/images/board/boards/green.thumbnail.png'),
    name: 'green',
  },
  {
    id: 7,
    src: require('../../public/assets/images/board/boards/grey.thumbnail.jpg'),
    name: 'grey',
  },
  {
    id: 8,
    src: require('../../public/assets/images/board/boards/horsey.thumbnail.jpg'),
    name: 'horsey',
  },
  {
    id: 9,
    src: require('../../public/assets/images/board/boards/leather.thumbnail.jpg'),
    name: 'leather',
  },
  {
    id: 10,
    src: require('../../public/assets/images/board/boards/maple.thumbnail.jpg'),
    name: 'maple',
  },
  {
    id: 11,
    src: require('../../public/assets/images/board/boards/maple2.thumbnail.jpg'),
    name: 'maple2',
  },
  {
    id: 12,
    src: require('../../public/assets/images/board/boards/marble.thumbnail.jpg'),
    name: 'marble',
  },
  {
    id: 13,
    src: require('../../public/assets/images/board/boards/metal.thumbnail.jpg'),
    name: 'metal',
  },
  {
    id: 14,
    src: require('../../public/assets/images/board/boards/newspaper.thumbnail.png'),
    name: 'newspaper',
  },

  {
    id: 15,
    src: require('../../public/assets/images/board/boards/olive.thumbnail.jpg'),
    name: 'olive',
  },

  {
    id: 16,
    src: require('../../public/assets/images/board/boards/pink-pyramid.thumbnail.png'),
    name: 'pink',
  },
  {
    id: 17,
    src: require(`../../public/assets/images/board/boards/purple-diag.thumbnail.png`),
    name: 'purple-diag',
  },
  {
    id: 18,
    src: require('../../public/assets/images/board/boards/wood.thumbnail.jpg'),
    name: 'wood',
  },
  {
    id: 19,
    src: require('../../public/assets/images/board/boards/wood2.thumbnail.jpg'),
    name: 'wood2',
  },
  {
    id: 20,
    src: require('../../public/assets/images/board/boards/wood3.thumbnail.jpg'),
    name: 'wood3',
  },
  {
    id: 21,
    src: require('../../public/assets/images/board/boards/wood4.thumbnail.jpg'),
    name: 'wood4',
  },
];
export const PIECE_SET = [
  {
    id: 1,
    src: require('../../public/assets/images/board/pieces/alpha.svg'),
    name: 'alpha',
  },
  {
    id: 2,
    src: require('../../public/assets/images/board/pieces/anarcandy.svg'),
    name: 'anarcandy',
  },
  {
    id: 3,
    src: require('../../public/assets/images/board/pieces/caliente.svg'),
    name: 'caliente',
  },
  {
    id: 4,
    src: require('../../public/assets/images/board/pieces/california.svg'),
    name: 'california',
  },
  {
    id: 5,
    src: require('../../public/assets/images/board/pieces/cardinal.svg'),
    name: 'cardinal',
  },
  {
    id: 6,
    src: require('../../public/assets/images/board/pieces/cburnett.svg'),
    name: 'cburnett',
  },
  {
    id: 7,
    src: require('../../public/assets/images/board/pieces/celtic.svg'),
    name: 'celtic',
  },
  {
    id: 8,
    src: require('../../public/assets/images/board/pieces/chess7.svg'),
    name: 'chess7',
  },
  {
    id: 9,
    src: require('../../public/assets/images/board/pieces/companion.svg'),
    name: 'companion',
  },
  {
    id: 10,
    src: require('../../public/assets/images/board/pieces/icpieces.svg'),
    name: 'icpieces',
  },
  {
    id: 11,
    src: require('../../public/assets/images/board/pieces/chessnut.svg'),
    name: 'chessnut',
  },
  {
    id: 12,
    src: require('../../public/assets/images/board/pieces/dubrovny.svg'),
    name: 'dubrovny',
  },
  {
    id: 13,
    src: require('../../public/assets/images/board/pieces/fantasy.svg'),
    name: 'fantasy',
  },
  {
    id: 14,
    src: require('../../public/assets/images/board/pieces/fresca.svg'),
    name: 'fresca',
  },

  {
    id: 15,
    src: require('../../public/assets/images/board/pieces/gioco.svg'),
    name: 'gioco',
  },

  {
    id: 16,
    src: require('../../public/assets/images/board/pieces/governor.svg'),
    name: 'governor',
  },
  {
    id: 17,
    src: require(`../../public/assets/images/board/pieces/horsey.svg`),
    name: 'horsey',
  },
  {
    id: 18,
    src: require('../../public/assets/images/board/pieces/kiwen-suwi.svg'),
    name: 'kiwen-suwi',
  },
  {
    id: 19,
    src: require('../../public/assets/images/board/pieces/kosal.svg'),
    name: 'kosal',
  },
  {
    id: 20,
    src: require('../../public/assets/images/board/pieces/leipzig.svg'),
    name: 'leipzig',
  },

  {
    id: 21,
    src: require('../../public/assets/images/board/pieces/maestro.svg'),
    name: 'maestro',
  },
  {
    id: 22,
    src: require('../../public/assets/images/board/pieces/merida.svg'),
    name: 'merida',
  },
  {
    id: 23,
    src: require('../../public/assets/images/board/pieces/mpchess.svg'),
    name: 'mpchess',
  },
  {
    id: 24,
    src: require('../../public/assets/images/board/pieces/tatiana.svg'),
    name: 'tatiana',
  },
  {
    id: 25,
    src: require('../../public/assets/images/board/pieces/pixel.svg'),
    name: 'pixel',
  },
  {
    id: 26,
    src: require('../../public/assets/images/board/pieces/reillycraig.svg'),
    name: 'reillycraig',
  },
  {
    id: 27,
    src: require('../../public/assets/images/board/pieces/riohacha.svg'),
    name: 'riohacha',
  },

  {
    id: 28,
    src: require('../../public/assets/images/board/pieces/spatial.svg'),
    name: 'spatial',
  },
  {
    id: 29,
    src: require('../../public/assets/images/board/pieces/staunty.svg'),
    name: 'staunty',
  },

  {
    id: 30,
    src: require('../../public/assets/images/board/pieces/shapes.svg'),
    name: 'shapes',
  },
  {
    id: 31,
    src: require('../../public/assets/images/board/pieces/letter.svg'),
    name: 'letter',
  },
];
export default {
  INITIAL_FEN,
  INITIAL_FEN_URL,
  CLEAR_FEN,
  INITIAL_PGN_STRING,
  BOARD_ORIENTATION,
  BOARD_THEME,
  LICHESS_DB_PARAMS,
  LICHESS_DB_PLAYER_PARAMS,
};
