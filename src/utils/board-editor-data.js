const boardEditordata = {
    baseUrl: 'http://localhost:8000/analysis',
    animation: { duration: 250 },
    is3d: false,
    i18n: {
      setTheBoard: 'Set the board',
      boardEditor: 'Board editor',
      startPosition: 'Starting position',
      clearBoard: 'Clear board',
      flipBoard: 'Flip board',
      loadPosition: 'Load position',
      popularOpenings: 'Popular openings',
      endgamePositions: 'Endgame positions',
      castling: 'Castling',
      whiteCastlingKingside: 'White O-O',
      blackCastlingKingside: 'Black O-O',
      whitePlays: 'White to play',
      blackPlays: 'Black to play',
      variant: 'Variant',
    },
  };
  boardEditordata.positions = [
    {
      eco: 'B00',
      name: 'King\u0027s Pawn',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    },
    {
      eco: 'B00',
      name: 'Open Game',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'B02',
      name: 'Alekhine\u0027s Defence',
      fen: 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2',
    },
    {
      eco: 'B04',
      name: 'Alekhine\u0027s Defence: Modern Variation',
      fen:
        'rnbqkb1r/ppp1pppp/3p4/3nP3/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 4',
    },
    {
      eco: 'C23',
      name: 'Bishop\u0027s Opening',
      fen:
        'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
    },
    {
      eco: 'B10',
      name: 'Caro-Kann Defence',
      fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'B12',
      name: 'Caro-Kann Defence: Advance Variation',
      fen:
        'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'B18',
      name: 'Caro-Kann Defence: Classical Variation',
      fen:
        'rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5',
    },
    {
      eco: 'B13',
      name: 'Caro-Kann Defence: Exchange Variation',
      fen: 'rnbqkbnr/pp2pppp/2p5/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'B14',
      name: 'Caro-Kann Defence: Panov-Botvinnik Attack',
      fen:
        'rnbqkb1r/pp2pppp/5n2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq - 2 5',
    },
    {
      eco: 'B17',
      name: 'Caro-Kann Defence: Steinitz Variation',
      fen: 'r1bqkbnr/pp1npppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5',
    },
    {
      eco: 'C21',
      name: 'Danish Gambit',
      fen: 'rnbqkbnr/pppp1ppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'C46',
      name: 'Four Knights Game',
      fen:
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
    },
    {
      eco: 'C47',
      name: 'Four Knights Game: Scotch Variation',
      fen:
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 4',
    },
    {
      eco: 'C48',
      name: 'Four Knights Game: Spanish Variation',
      fen:
        'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4',
    },
    {
      eco: 'C00',
      name: 'French Defence',
      fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'C02',
      name: 'French Defence: Advance Variation',
      fen:
        'rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'C11',
      name: 'French Defence: Burn Variation',
      fen:
        'rnbqkb1r/ppp2ppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq - 0 5',
    },
    {
      eco: 'C11',
      name: 'French Defence: Classical Variation',
      fen:
        'rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4',
    },
    {
      eco: 'C01',
      name: 'French Defence: Exchange Variation',
      fen: 'rnbqkbnr/ppp2ppp/4p3/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'C10',
      name: 'French Defence: Rubinstein Variation',
      fen:
        'rnbqkbnr/ppp2ppp/4p3/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4',
    },
    {
      eco: 'C03',
      name: 'French Defence: Tarrasch Variation',
      fen:
        'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq - 1 3',
    },
    {
      eco: 'C15',
      name: 'French Defence: Winawer Variation',
      fen:
        'rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4',
    },
    {
      eco: 'C50',
      name: 'Giuoco Piano',
      fen:
        'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    },
    {
      eco: 'C50',
      name: 'Italian Game',
      fen:
        'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    },
    {
      eco: 'C51',
      name: 'Evans Gambit',
      fen:
        'r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4',
    },
    {
      eco: 'C50',
      name: 'Italian Game: Hungarian Defence',
      fen:
        'r1bqk1nr/ppppbppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    },
    {
      eco: 'C55',
      name: 'Italian Game: Two Knights Defence',
      fen:
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    },
    {
      eco: 'C30',
      name: 'King\u0027s Gambit',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2',
    },
    {
      eco: 'C33',
      name: 'King\u0027s Gambit Accepted',
      fen: 'rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'C33',
      name: 'King\u0027s Gambit Accepted: Bishop\u0027s Gambit',
      fen: 'rnbqkbnr/pppp1ppp/8/8/2B1Pp2/8/PPPP2PP/RNBQK1NR b KQkq - 1 3',
    },
    {
      eco: 'C36',
      name: 'King\u0027s Gambit Accepted: Modern Defence',
      fen:
        'rnbqkbnr/ppp2ppp/8/3p4/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq d6 0 4',
    },
    {
      eco: 'C30',
      name: 'King\u0027s Gambit Accepted: Classical Variation',
      fen:
        'rnbqkbnr/pppp1p1p/8/6p1/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq - 0 4',
    },
    {
      eco: 'C30',
      name: 'King\u0027s Gambit Declined: Classical Variation',
      fen:
        'rnbqk1nr/pppp1ppp/8/2b1p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 1 3',
    },
    {
      eco: 'C31',
      name: 'King\u0027s Gambit: Falkbeer Countergambit',
      fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'B06',
      name: 'Modern Defence',
      fen: 'rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'B06',
      name: 'Modern Defence: Robatsch Defence',
      fen:
        'rnbqk1nr/ppppppbp/6p1/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 3',
    },
    {
      eco: 'C41',
      name: 'Philidor Defence',
      fen:
        'rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    },
    {
      eco: 'C41',
      name: 'Philidor Defence: Lion Variation',
      fen:
        'r1bqkb1r/pppn1ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 2 5',
    },
    {
      eco: 'B07',
      name: 'Lion Variation: Anti-Philidor',
      fen:
        'r1bqkb1r/pppn1ppp/3p1n2/4p3/3PPP2/2N5/PPP3PP/R1BQKBNR w KQkq - 0 5',
    },
    {
      eco: 'B07',
      name: 'Pirc Defence',
      fen:
        'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 2 3',
    },
    {
      eco: 'B09',
      name: 'Pirc Defence: Austrian Attack',
      fen:
        'rnbqkb1r/ppp1pp1p/3p1np1/8/3PPP2/2N5/PPP3PP/R1BQKBNR b KQkq - 0 4',
    },
    {
      eco: 'B07',
      name: 'Pirc Defence: Classical Variation',
      fen:
        'rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 1 4',
    },
    {
      eco: 'B07',
      name: 'Pirc Defence: Lion Variation',
      fen:
        'r1bqkb1r/pppnpppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 3 4',
    },
    {
      eco: 'C42',
      name: 'Petrov\u0027s Defence',
      fen:
        'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    },
    {
      eco: 'C42',
      name: 'Petrov\u0027s Defence: Classical Attack',
      fen:
        'rnbqkb1r/ppp2ppp/3p4/8/3Pn3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 5',
    },
    {
      eco: 'C43',
      name: 'Petrov\u0027s Defence: Steinitz Attack',
      fen:
        'rnbqkb1r/pppp1ppp/5n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3',
    },
    {
      eco: 'C42',
      name: 'Petrov\u0027s Defence: Three Knights Game',
      fen:
        'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 3 3',
    },
    {
      eco: 'C60',
      name: 'Ruy Lopez',
      fen:
        'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    },
    {
      eco: 'C65',
      name: 'Ruy Lopez: Berlin Defence',
      fen:
        'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    },
    {
      eco: 'C64',
      name: 'Ruy Lopez: Classical Variation',
      fen:
        'r1bqk1nr/pppp1ppp/2n5/1Bb1p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    },
    {
      eco: 'C84',
      name: 'Ruy Lopez: Closed Variation',
      fen:
        'r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 b kq - 1 7',
    },
    {
      eco: 'C68',
      name: 'Ruy Lopez: Exchange Variation',
      fen:
        'r1bqkbnr/1ppp1ppp/p1B5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4',
    },
    {
      eco: 'C89',
      name: 'Ruy Lopez: Marshall Attack',
      fen:
        'r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - - 0 9',
    },
    {
      eco: 'C63',
      name: 'Ruy Lopez: Schliemann Defence',
      fen:
        'r1bqkbnr/pppp2pp/2n5/1B2pp2/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    },
    {
      eco: 'B01',
      name: 'Scandinavian Defence',
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'B01',
      name: 'Scandinavian Defence: Modern Variation',
      fen:
        'rnbqkb1r/ppp1pppp/5n2/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'B01',
      name: 'Scandinavian Defence: Icelandic-Palme Gambit',
      fen:
        'rnbqkb1r/ppp2ppp/4pn2/3P4/2P5/8/PP1P1PPP/RNBQKBNR w KQkq - 0 4',
    },
    {
      eco: 'C44',
      name: 'Scotch Game',
      fen:
        'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3',
    },
    {
      eco: 'C45',
      name: 'Scotch Game: Classical Variation',
      fen:
        'r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5',
    },
    {
      eco: 'C45',
      name: 'Scotch Game: Mieses Variation',
      fen:
        'r1bqkb1r/p1pp1ppp/2p2n2/4P3/8/8/PPP2PPP/RNBQKB1R b KQkq - 0 6',
    },
    {
      eco: 'C45',
      name: 'Scotch Game: Steinitz Variation',
      fen:
        'r1b1kbnr/pppp1ppp/2n5/8/3NP2q/8/PPP2PPP/RNBQKB1R w KQkq - 1 5',
    },
    {
      eco: 'B20',
      name: 'Sicilian Defence',
      fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'B36',
      name: 'Sicilian Defence: Accelerated Dragon',
      fen:
        'r1bqkbnr/pp1ppp1p/2n3p1/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5',
    },
    {
      eco: 'B22',
      name: 'Sicilian Defence: Alapin Variation',
      fen:
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2',
    },
    {
      eco: 'B23',
      name: 'Sicilian Defence: Closed Variation',
      fen:
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2',
    },
    {
      eco: 'B70',
      name: 'Sicilian Defence: Dragon Variation',
      fen:
        'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    },
    {
      eco: 'B23',
      name: 'Sicilian Defence: Grand Prix Attack',
      fen: 'rnbqkbnr/pp1ppppp/8/2p5/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2',
    },
    {
      eco: 'B27',
      name: 'Sicilian Defence: Hyper-Accelerated Dragon',
      fen:
        'rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    },
    {
      eco: 'B41',
      name: 'Sicilian Defence: Kan Variation',
      fen:
        'rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5',
    },
    {
      eco: 'B90',
      name: 'Sicilian Defence: Najdorf Variation',
      fen:
        'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    },
    {
      eco: 'B60',
      name: 'Sicilian Defence: Richter-Rauzer Variation',
      fen:
        'r1bqkb1r/pp2pppp/2np1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 4 6',
    },
    {
      eco: 'B80',
      name: 'Sicilian Defence: Scheveningen Variation',
      fen:
        'rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    },
    {
      eco: 'B21',
      name: 'Sicilian Defence: Smith-Morra Gambit',
      fen: 'rnbqkbnr/pp1ppppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'C25',
      name: 'Vienna Game',
      fen:
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2',
    },
    {
      eco: 'C27',
      name: 'Vienna Game: Frankenstein-Dracula Variation',
      fen:
        'rnbqkb1r/pppp1ppp/8/4p3/2B1n3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 0 4',
    },
    {
      eco: 'C46',
      name: 'Four Knights Game: Halloween Gambit',
      fen:
        'r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/2N5/PPPP1PPP/R1BQKB1R b KQkq - 0 4',
    },
    {
      eco: 'C20',
      name: 'King\u0027s Pawn Game: Wayward Queen Attack',
      fen:
        'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2',
    },
    {
      eco: 'C20',
      name: 'Bongcloud Attack',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR b kq - 1 2',
    },
    {
      eco: 'A40',
      name: 'Queen\u0027s Pawn',
      fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
    },
    {
      eco: 'A57',
      name: 'Benko Gambit',
      fen:
        'rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4',
    },
    {
      eco: 'A61',
      name: 'Benoni Defence: Modern Benoni',
      fen:
        'rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4',
    },
    {
      eco: 'A43',
      name: 'Benoni Defence: Czech Benoni',
      fen:
        'rnbqkb1r/pp1p1ppp/5n2/2pPp3/2P5/8/PP2PPPP/RNBQKBNR w KQkq e6 0 4',
    },
    {
      eco: 'D00',
      name: 'Blackmar Gambit',
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2',
    },
    {
      eco: 'E11',
      name: 'Bogo-Indian Defence',
      fen:
        'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4',
    },
    {
      eco: 'E00',
      name: 'Catalan Opening',
      fen:
        'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3',
    },
    {
      eco: 'E06',
      name: 'Catalan Opening: Closed Variation',
      fen:
        'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq - 3 5',
    },
    {
      eco: 'A80',
      name: 'Dutch Defence',
      fen: 'rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'A96',
      name: 'Dutch Defence: Classical Variation',
      fen:
        'rnbq1rk1/ppp1b1pp/3ppn2/5p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 0 7',
    },
    {
      eco: 'A87',
      name: 'Dutch Defence: Leningrad Variation',
      fen:
        'rnbqk2r/ppppp1bp/5np1/5p2/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq - 3 5',
    },
    {
      eco: 'A83',
      name: 'Dutch Defence: Staunton Gambit',
      fen:
        'rnbqkb1r/ppppp1pp/5n2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR b KQkq - 3 4',
    },
    {
      eco: 'A92',
      name: 'Dutch Defence: Stonewall Variation',
      fen:
        'rnbq1rk1/ppp1b1pp/4pn2/3p1p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 0 7',
    },
    {
      eco: 'D80',
      name: 'Gr\u00fcnfeld Defence',
      fen:
        'rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4',
    },
    {
      eco: 'D82',
      name: 'Gr\u00fcnfeld Defence: Brinckmann Attack',
      fen:
        'rnbqkb1r/ppp1pp1p/5np1/3p4/2PP1B2/2N5/PP2PPPP/R2QKBNR b KQkq - 1 4',
    },
    {
      eco: 'D85',
      name: 'Gr\u00fcnfeld Defence: Exchange Variation',
      fen:
        'rnbqkb1r/ppp1pp1p/6p1/3n4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5',
    },
    {
      eco: 'D80',
      name: 'Gr\u00fcnfeld Defence: Russian Variation',
      fen:
        'rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/1QN5/PP2PPPP/R1B1KBNR b KQkq - 1 4',
    },
    {
      eco: 'D90',
      name: 'Gr\u00fcnfeld Defence: Taimanov Variation',
      fen:
        'rnbqk2r/ppp1ppbp/5np1/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq - 3 5',
    },
    {
      eco: 'E61',
      name: 'King\u0027s Indian Defence',
      fen:
        'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'E77',
      name: 'King\u0027s Indian Defence: 4.e4',
      fen:
        'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5',
    },
    {
      eco: 'E73',
      name: 'King\u0027s Indian Defence: Averbakh Variation',
      fen:
        'rnbq1rk1/ppp1ppbp/3p1np1/6B1/2PPP3/2N5/PP2BPPP/R2QK1NR b KQ - 3 6',
    },
    {
      eco: 'E62',
      name: 'King\u0027s Indian Defence: Fianchetto Variation',
      fen:
        'rnbqk2r/ppp1ppbp/3p1np1/8/2PP4/2N2NP1/PP2PP1P/R1BQKB1R b KQkq - 0 5',
    },
    {
      eco: 'E76',
      name: 'King\u0027s Indian Defence: Four Pawns Attack',
      fen:
        'rnbqk2r/ppp1ppbp/3p1np1/8/2PPPP2/2N5/PP4PP/R1BQKBNR b KQkq - 0 5',
    },
    {
      eco: 'E91',
      name: 'King\u0027s Indian Defence: Classical Variation',
      fen:
        'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 3 6',
    },
    {
      eco: 'E80',
      name: 'King\u0027s Indian Defence: S\u00e4misch Variation',
      fen:
        'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq - 0 5',
    },
    {
      eco: 'A41',
      name: 'Queens\u0027s Pawn Game: Modern Defence',
      fen:
        'rnbqk1nr/ppp1ppbp/3p2p1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    },
    {
      eco: 'E20',
      name: 'Nimzo-Indian Defence',
      fen:
        'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    },
    {
      eco: 'E32',
      name: 'Nimzo-Indian Defence: Classical Variation',
      fen:
        'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PPQ1PPPP/R1B1KBNR b KQkq - 3 4',
    },
    {
      eco: 'E43',
      name: 'Nimzo-Indian Defence: Fischer Variation',
      fen:
        'rnbqk2r/p1pp1ppp/1p2pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQkq - 0 5',
    },
    {
      eco: 'E41',
      name: 'Nimzo-Indian Defence: H\u00fcbner Variation',
      fen:
        'r1bqk2r/pp3ppp/2nppn2/2p5/2PP4/2PBPN2/P4PPP/R1BQK2R w KQkq - 0 8',
    },
    {
      eco: 'E21',
      name: 'Nimzo-Indian Defence: Kasparov Variation',
      fen:
        'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4',
    },
    {
      eco: 'E30',
      name: 'Nimzo-Indian Defence: Leningrad Variation',
      fen:
        'rnbqk2r/pppp1ppp/4pn2/6B1/1bPP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4',
    },
    {
      eco: 'E26',
      name: 'Nimzo-Indian Defence: S\u00e4misch Variation',
      fen:
        'rnbqk2r/pppp1ppp/4pn2/8/2PP4/P1P5/4PPPP/R1BQKBNR b KQkq - 0 5',
    },
    {
      eco: 'A53',
      name: 'Old Indian Defence',
      fen:
        'rnbqkb1r/ppp1pppp/3p1n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'D06',
      name: 'Queen\u0027s Gambit',
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
    },
    {
      eco: 'D20',
      name: 'Queen\u0027s Gambit Accepted',
      fen: 'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'D43',
      name: 'Queen\u0027s Gambit Declined: Semi-Slav Defence',
      fen:
        'rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5',
    },
    {
      eco: 'D10',
      name: 'Queen\u0027s Gambit Declined: Slav Defence',
      fen:
        'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'D40',
      name: 'Queen\u0027s Gambit Declined: Semi-Tarrasch Defence',
      fen:
        'rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5',
    },
    {
      eco: 'D32',
      name: 'Queen\u0027s Gambit Declined: Tarrasch Defence',
      fen:
        'rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4',
    },
    {
      eco: 'D08',
      name: 'Queen\u0027s Gambit: Albin Countergambit',
      fen: 'rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'D07',
      name: 'Queen\u0027s Gambit: Chigorin Defence',
      fen:
        'r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3',
    },
    {
      eco: 'E12',
      name: 'Queen\u0027s Indian Defence',
      fen:
        'rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4',
    },
    {
      eco: 'D02',
      name: 'London System',
      fen:
        'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3',
    },
    {
      eco: 'D00',
      name: 'London System: Mason Attack',
      fen:
        'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2',
    },
    {
      eco: 'D01',
      name: 'Rapport-Jobava System',
      fen:
        'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N5/PPP1PPPP/R2QKBNR b KQkq - 3 3',
    },
    {
      eco: 'D03',
      name: 'Torre Attack',
      fen:
        'rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3',
    },
    {
      eco: 'D01',
      name: 'Richter-Veresov Attack',
      fen:
        'rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/2N5/PPP1PPPP/R2QKBNR b KQkq - 3 3',
    },
    {
      eco: 'A52',
      name: 'Budapest Defence',
      fen:
        'rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    },
    {
      eco: 'D00',
      name: 'Closed Game',
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'A45',
      name: 'Trompowsky Attack',
      fen:
        'rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2',
    },
    {
      eco: 'A04',
      name: 'Zukertort Opening',
      fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    },
    {
      eco: 'A07',
      name: 'King\u0027s Indian Attack',
      fen:
        'rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2',
    },
    {
      eco: 'A09',
      name: 'R\u00e9ti Opening',
      fen:
        'rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq - 0 2',
    },
    {
      eco: 'A10',
      name: 'English Opening',
      fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1',
    },
    {
      eco: 'A20',
      name: 'English Opening: Reversed Sicilian',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'A30',
      name: 'English Opening: Symmetrical Variation',
      fen: 'rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'A26',
      name: 'English Opening: Closed System',
      fen:
        'r1bqk1nr/ppp2pbp/2np2p1/4p3/2P5/2NP2P1/PP2PPBP/R1BQK1NR w KQkq - 0 6',
    },
    {
      eco: 'A01',
      name: 'Nimzo-Larsen Attack',
      fen: 'rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1',
    },
    {
      eco: 'A00',
      name: 'Sokolsky Opening',
      fen: 'rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq - 0 1',
    },
    {
      eco: 'A02',
      name: 'Bird\u0027s Opening',
      fen: 'rnbqkbnr/pppppppp/8/8/5P2/8/PPPPP1PP/RNBQKBNR b KQkq - 0 1',
    },
    {
      eco: 'A02',
      name: 'Bird\u0027s Opening: Dutch Variation',
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/5P2/8/PPPPP1PP/RNBQKBNR w KQkq - 0 2',
    },
    {
      eco: 'A00',
      name: 'Hungarian Opening',
      fen: 'rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQKBNR b KQkq - 0 1',
    },
  ];
  boardEditordata.endgamePositions = [
    {
      name: 'Mate Queen and Rook',
      fen: '8/8/8/3k4/8/8/8/5RQK w - - 0 1',
    },
    { name: 'Mate Two Rooks', fen: '8/8/8/8/8/4k3/6R1/6RK w - - 0 1' },
    { name: 'Mate Queen I', fen: '8/8/5Q2/2k5/4K3/8/8/8 w - - 0 1' },
    { name: 'Mate Queen II', fen: '8/8/8/3k4/8/8/8/6QK w - - 0 1' },
    { name: 'Mate Rook I', fen: '3k4/R7/8/4K3/8/8/8/8 w - - 0 1' },
    { name: 'Mate Rook II', fen: '8/8/8/8/4k3/8/8/6RK w - - 0 1' },
    { name: 'Queen vs Bishop', fen: '8/8/3B4/6K1/8/8/2k5/q7 b - - 0 1' },
    { name: 'Queen vs Knight', fen: '8/8/8/3nk3/8/3Q4/8/7K w - - 0 1' },
    { name: 'Pawn Ending I', fen: '8/3k4/3P4/3K4/8/8/8/8 b - - 0 1' },
    { name: 'Pawn Ending II', fen: '8/3k4/3P4/3K4/8/8/8/8 w - - 0 1' },
    { name: 'Pawn Ending III', fen: '6k1/8/8/8/8/8/P7/7K w - - 0 1' },
    { name: 'Pawn Ending IV', fen: '8/4k3/2K5/8/8/8/1P6/8 w - - 0 1' },
    { name: 'Pawn Ending V', fen: '5k2/8/4K3/5P2/8/8/8/8 w - - 0 1' },
    { name: 'Pawn Ending VI', fen: '5k2/8/5K2/5P2/8/8/8/8 w - - 0 1' },
    { name: 'Pawn Ending VII', fen: '5k2/8/4K3/5P2/8/8/8/8 b - - 0 1' },
    { name: 'Pawn Ending VIII', fen: '5k2/8/5K2/5P2/8/8/8/8 b - - 0 1' },
    { name: 'Pawn Ending IX', fen: '7k/5K2/8/6P1/8/8/8/8 w - - 0 1' },
    { name: 'Pawn Ending X', fen: '5k2/8/8/8/3PK3/8/8/8 w - - 0 1' },
    { name: 'Pawn Ending XI', fen: '5k2/8/8/8/3PK3/8/8/8 b - - 0 1' },
    { name: 'Pawn Ending XII', fen: '8/6k1/8/6K1/8/6P1/8/8 w - - 0 1' },
    { name: 'Pawn Ending XIII', fen: '1k6/8/PK6/8/8/8/8/8 b - - 0 1' },
    { name: 'Pawn Ending XIV', fen: '8/4k3/6K1/8/7P/8/8/8 b - - 0 1' },
    { name: 'Knight vs Pawn I', fen: '8/K7/8/8/8/1k6/1N1p4/8 w - - 0 1' },
    {
      name: 'Knight vs Pawn II',
      fen: '8/8/8/8/5N2/8/2p4K/2k5 w - - 0 1',
    },
    {
      name: 'Knight vs Pawn III',
      fen: '8/8/8/8/4N3/1p6/7K/1k6 b - - 0 1',
    },
    { name: 'Knight vs Pawn IV', fen: '8/8/K7/4N3/8/7p/7k/8 w - - 0 1' },
    { name: 'Knight vs Pawn V', fen: 'K7/8/8/5N2/8/3k3p/8/8 w - - 0 1' },
    {
      name: 'Knight vs Pawn VI',
      fen: '8/2K5/8/8/4N3/2k5/7p/8 b - - 0 1',
    },
    {
      name: 'Knight vs Pawn VII',
      fen: '8/8/8/8/8/p7/2K1N3/k7 w - - 0 1',
    },
    {
      name: 'Knight vs Pawn VIII',
      fen: '8/k7/8/8/7p/8/6N1/4K3 b - - 0 1',
    },
    { name: 'Rook vs Pawn I', fen: '8/8/8/5PK1/8/k7/8/3r4 b - - 0 1' },
    { name: 'Rook vs Pawn II', fen: '8/8/8/5PK1/8/k7/8/3r4 w - - 0 1' },
    { name: 'Rook vs Pawn III', fen: '7r/8/8/2KP4/8/8/2k5/8 b - - 0 1' },
    { name: 'Rook vs Pawn IV', fen: '8/8/8/8/7P/6K1/1r6/k7 b - - 0 1' },
    { name: 'Rook vs Pawn IV', fen: '8/8/8/5KP1/8/5k2/8/r7 b - - 0 1' },
    { name: 'Rook vs Pawn X', fen: '8/8/8/8/4KP2/8/r3k3/8 b - - 0 1' },
    { name: 'Rook vs Pawn XI', fen: '8/8/8/8/4KP2/8/r3k3/8 w - - 0 1' },
    { name: 'Rook vs Pawn XII', fen: '4r3/8/8/3KP3/k7/8/8/8 b - - 0 1' },
    {
      name: 'Rook vs Pawn XIII',
      fen: '8/2K5/8/1P3k2/8/8/8/7r b - - 0 1',
    },
    { name: 'Rook vs Pawn XIV', fen: '7r/2K5/k7/3P4/8/8/8/8 b - - 0 1' },
    { name: 'Rook vs Pawn XV', fen: '8/8/8/3r4/2KP4/8/2k5/8 b - - 0 1' },
    {
      name: 'Rook vs Pawn XVI',
      fen: '8/8/5K2/8/6P1/8/3r4/4k3 b - - 0 1',
    },
    { name: 'Rook vs Pawn XVII', fen: '8/8/8/6KP/8/6k1/8/r7 b - - 0 1' },
    { name: 'Rook vs Pawn XVIII', fen: '8/4k1KP/8/8/8/8/8/r7 b - - 0 1' },
    { name: 'Rook vs Pawn XIX', fen: '8/8/4k1KP/8/8/8/8/r7 w - - 0 1' },
    { name: 'Rook vs Pawn XX', fen: '8/8/4k1KP/8/8/8/8/r7 b - - 0 1' },
    {
      name: 'Rook vs Pawn XXI',
      fen: '8/2P2k2/3K4/5r2/8/8/8/8 b - - 0 1',
    },
    { name: 'Pawns Ending I', fen: '8/8/3k3p/3P3P/2K5/8/8/8 w - - 0 1' },
    { name: 'Pawns Ending II', fen: '8/8/8/1k5p/7P/1PK5/8/8 w - - 0 1' },
    {
      name: 'Pawns Ending III',
      fen: '8/8/p7/P7/3k4/3P4/3K4/8 w - - 0 1',
    },
    { name: 'Pawns Ending IV', fen: '8/8/8/p7/P7/3k4/3P4/3K4 w - - 0 1' },
    { name: 'Pawn Ending XV', fen: 'k7/8/2P5/K7/8/8/8/8 w - - 0 1' },
    { name: 'Pawn Ending XVI', fen: '8/6k1/4P3/6K1/8/8/8/8 w - - 0 1' },
    { name: 'Pawn Ending XVII', fen: 'k7/8/1PK5/8/8/8/8/8 w - - 0 1' },
    { name: 'Queen vs Pawn I', fen: '8/1PK5/8/8/8/4q3/8/1k6 b - - 0 1' },
    { name: 'Queen vs Pawn II', fen: '8/3PK3/8/8/8/8/4k3/5q2 b - - 0 1' },
    {
      name: 'Queen vs Pawn III',
      fen: '8/5K1P/8/8/3q4/8/8/2k5 w - - 0 1',
    },
    { name: 'Queen vs Pawn IV', fen: '8/6KP/8/4k3/3q4/8/8/8 b - - 0 1' },
    { name: 'Queen vs Pawn V', fen: '8/5P2/3K4/8/8/1k6/8/q7 w - - 0 1' },
    { name: 'Queen vs Pawn VI', fen: '8/5PK1/8/6k1/8/8/q7/8 b - - 0 1' },
    { name: 'Queen vs Pawn VII', fen: '8/4KP2/8/8/6k1/8/q7/8 b - - 0 1' },
    {
      name: 'Queen vs Pawn VIII',
      fen: '8/4KP2/8/1k6/8/8/q7/8 b - - 0 1',
    },
    { name: 'Queen vs Pawn IX', fen: '8/8/8/8/8/k2K4/2Q5/q7 w - - 0 1' },
    {
      name: 'Rook vs 2 Pawns I',
      fen: '8/8/P7/1P5k/8/8/7K/5r2 w - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns II',
      fen: '8/8/P7/1P5k/8/8/7K/6r1 b - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns III',
      fen: '6r1/8/P7/1P5k/8/8/7K/8 w - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns IV',
      fen: '6r1/8/P7/1P5k/8/8/7K/8 b - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns V',
      fen: 'r3k3/8/3PP3/3K4/8/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns VI',
      fen: 'r7/2kPK3/4P3/8/8/8/8/8 b - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns VII',
      fen: 'r7/3kPK2/5P2/8/8/8/8/8 b - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns VIII',
      fen: 'r7/4kPK1/6P1/8/8/8/8/8 b - - 0 1',
    },
    { name: 'Rook vs 2 Pawns IX', fen: 'r7/5kPK/7P/8/8/8/8/8 b - - 0 1' },
    {
      name: 'Rook vs 2 Pawns X',
      fen: '8/8/5KP1/5P2/8/2k4r/8/8 b - - 0 1',
    },
    {
      name: 'Rook vs 2 Pawns XI',
      fen: '8/8/8/1P6/PK6/8/r7/2k5 w - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook I',
      fen: '4k3/R7/8/3KP3/8/6r1/8/8 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook II - Lucena',
      fen: '3K4/3P1k2/8/8/8/8/7r/4R3 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook III',
      fen: '4K3/4P1k1/8/8/8/8/r7/5R2 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook IV',
      fen: '1k6/7R/8/KP6/8/8/8/2r5 w - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook V - Philidor',
      fen: '4k3/7R/8/3KPr2/8/8/8/8 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook VI',
      fen: 'r7/3RK1k1/4P3/8/8/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook VII',
      fen: '1r6/R3K1k1/4P3/8/8/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook VIII',
      fen: '7r/8/4k3/8/2P5/2K5/8/3R4 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook IX',
      fen: '2r5/8/5k2/8/2P5/2K5/8/4R3 w - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook X',
      fen: '3r4/8/k7/8/3P4/3K4/8/1R6 w - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook XI',
      fen: '1r6/8/8/2R5/1P1k4/1K6/8/8 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook XII',
      fen: '2r5/8/8/3R4/2P1k3/2K5/8/8 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook XIII',
      fen: '3r4/8/8/8/7R/3P1k2/3K4/8 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook XIV',
      fen: '2r5/8/7R/4k3/2P5/2K5/8/8 w - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook XV',
      fen: '2r5/8/7R/4k3/2P5/2K5/8/8 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook XVI',
      fen: '4r3/8/8/5R2/4P1k1/4K3/8/8 b - - 0 1',
    },
    { name: 'Pawns Ending I', fen: '8/1k6/8/1P6/1P6/1K6/8/8 w - - 0 1' },
    { name: 'Pawns Ending II', fen: '1k6/8/1P6/1P6/1K6/8/8/8 w - - 0 1' },
    { name: 'Rook vs Bishop I', fen: '7k/R7/7K/8/8/1b6/8/8 w - - 0 1' },
    {
      name: 'Rook vs Bishop II',
      fen: '6k1/5R2/6K1/8/8/8/8/6b1 w - - 0 1',
    },
    { name: 'Rook vs Knight I', fen: '8/8/8/8/8/3k4/r7/3NK3 w - - 0 1' },
    { name: 'Rook vs Knight II', fen: '8/8/8/8/8/6k1/r7/6NK w - - 0 1' },
    { name: 'Rook vs Knight III', fen: '8/8/8/8/8/6k1/r7/6KN b - - 0 1' },
    {
      name: 'Opposite Color Bishops I',
      fen: '3k4/1K6/2PbP3/3B4/8/8/8/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops II',
      fen: '8/2bB4/2P5/6k1/4K3/5P2/8/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops III',
      fen: '8/2kB4/2P5/6b1/4K3/5P2/8/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops IV',
      fen: '2k5/8/3P1K2/2B3P1/2b5/8/8/8 b - - 0 1',
    },
    {
      name: 'Opposite Color Bishops V',
      fen: '8/3k4/3B1K2/4P3/1Pb5/8/8/8 b - - 0 1',
    },
    {
      name: 'Opposite Color Bishops VI',
      fen: '8/bB6/P2k4/3P4/4K3/8/8/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops VII',
      fen: '1b6/1P6/4Bk2/5P2/4K3/8/8/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops VIII',
      fen: '2b5/8/1P1B4/8/4kP2/8/5K2/8 b - - 0 1',
    },
    {
      name: 'Opposite Color Bishops IX',
      fen: '8/8/8/2Bk4/1P3Pb1/4K3/8/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops X',
      fen: '8/b7/P7/3Bk3/2K1P3/8/8/8 w - - 0 1',
    },
    { name: 'Pawns Ending III', fen: '8/8/8/5k2/5P1P/8/8/K7 w - - 0 1' },
    { name: 'Pawns Ending IV', fen: '8/8/2k5/8/P2P4/8/8/7K b - - 0 1' },
    {
      name: 'Mate Bishop + Knight',
      fen: '8/8/8/8/4k3/8/6K1/6BN w - - 0 1',
    },
    { name: 'Mate Two Bishops', fen: 'K7/5B2/7B/8/4k3/8/8/8 w - - 0 1' },
    {
      name: 'Rook + Pawn vs Rook XVII',
      fen: 'R7/P4k2/8/8/8/8/6K1/r7 b - - 0 1',
    },
    {
      name: 'Rook + Pawn vs Rook XVIII',
      fen: 'R7/5k2/P7/8/8/8/6K1/r7 b - - 0 1',
    },
    {
      name: 'Opposite Color Bishops XI',
      fen: '4k3/8/4PP2/4K3/1b6/3B4/8/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops XII',
      fen: '3bk3/8/4PP2/4K3/8/8/4B3/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops XIII',
      fen: '6k1/8/6PP/5K2/2B5/2b5/8/8 b - - 0 1',
    },
    {
      name: 'Opposite Color Bishops XIV',
      fen: '8/4k3/8/4PP2/4K3/1b6/3B4/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops XV',
      fen: '2b5/4k3/8/4PP2/4K3/8/3B4/8 w - - 0 1',
    },
    {
      name: 'Opposite Color Bishops XVI',
      fen: '8/8/3k4/8/3PP3/4K3/8/4Bb2 b - - 0 1',
    },
    {
      name: 'Opposite Color Bishops XVII',
      fen: '8/5kb1/8/8/6K1/3B4/4PP2/8 w - - 0 1',
    },
    { name: 'Pawns Ending V', fen: 'k7/8/1p6/1P6/8/8/7K/8 w - - 0 1' },
    { name: 'Pawns Ending VI', fen: '8/2K5/4p3/4P3/6k1/8/8/8 w - - 0 1' },
    {
      name: 'Pawns Ending VII',
      fen: '8/8/8/7k/3p2p1/3P4/6KP/8 b - - 0 1',
    },
    {
      name: 'Pawns Ending VIII',
      fen: '8/8/8/5p2/3k4/5P2/8/6K1 w - - 0 1',
    },
    { name: 'Pawns Ending IX', fen: '8/1p6/1P6/8/7K/8/8/1k6 w - - 0 1' },
    { name: 'Pawns Ending X', fen: '8/p4K2/P7/8/8/8/1k6/8 w - - 0 1' },
    { name: 'Pawns Ending XI', fen: '8/p4K2/P7/8/8/8/7k/8 w - - 0 1' },
    { name: 'Pawns Ending XII', fen: '8/8/5p2/8/4P1k1/8/7K/8 w - - 0 1' },
    {
      name: 'Pawns Ending XIII',
      fen: '8/6p1/7k/8/1K6/8/1P6/8 w - - 0 1',
    },
    { name: 'Pawns Ending XIV', fen: '7K/8/k1P5/7p/8/8/8/8 w - - 0 1' },
    { name: 'Pawns Ending XV', fen: '8/5p2/2k5/K7/8/1P6/8/8 b - - 0 1' },
    {
      name: 'Pawns Ending XVI',
      fen: '8/p7/P7/8/8/3k4/3P4/3K4 w - - 0 1',
    },
    {
      name: 'Pawns Ending XVII',
      fen: '5k2/5P1p/4K3/8/8/8/7P/8 w - - 0 1',
    },
    {
      name: 'Pawns Ending XVIII',
      fen: '2k5/8/p1P5/P2K4/8/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + h Pawn I',
      fen: 'K7/P4k2/8/8/8/8/4R3/1r6 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + h Pawn II',
      fen: '8/1K1k4/2R5/P7/8/8/8/7r w - - 0 1',
    },
    {
      name: 'Rook vs Rook + h Pawn III',
      fen: '8/1K1k4/2R5/P7/8/8/8/7r b - - 0 1',
    },
    {
      name: 'Same Color Bishops I',
      fen: '5k2/2K5/3P4/1b5B/8/8/8/8 w - - 0 1',
    },
    {
      name: 'Same Color Bishops II',
      fen: '4B3/2K5/3P4/2k5/8/7b/8/8 w - - 0 1',
    },
    {
      name: 'Same Color Bishops III',
      fen: '8/K7/1P6/k4B2/8/5b2/8/8 w - - 0 1',
    },
    {
      name: 'Same Color Bishops IV',
      fen: '5K2/5P2/3b1k1B/8/8/8/8/8 w - - 0 1',
    },
    {
      name: 'Same Color Bishops VI',
      fen: '8/8/2k5/5PK1/8/2b5/7B/8 b - - 0 1',
    },
    {
      name: 'Same Color Bishops VII',
      fen: '5k2/3b4/3P1K2/8/8/8/8/3B4 w - - 0 1',
    },
    {
      name: 'Bishop vs Knight I',
      fen: '1K6/4B3/8/8/8/2n2p2/5k2/8 w - - 0 1',
    },
    {
      name: 'Bishop vs Knight II',
      fen: '8/8/8/8/B6n/7p/6k1/4K3 w - - 0 1',
    },
    {
      name: 'Bishop vs Knight III',
      fen: '8/8/5B2/8/1n6/8/p1k1K3/8 b - - 0 1',
    },
    {
      name: 'Bishop vs Knight IV',
      fen: '2K5/3Pkn2/8/8/8/5B2/8/8 w - - 0 1',
    },
    {
      name: 'Bishop vs Knight V',
      fen: '8/4K3/3P1n2/3k4/8/8/2B5/8 w - - 0 1',
    },
    { name: 'Pawns Ending XIX', fen: '8/7p/5k2/8/5K2/8/6PP/8 b - - 0 1' },
    { name: 'Pawns Ending XX', fen: '8/7p/5k2/8/5K2/8/6PP/8 w - - 0 1' },
    {
      name: 'Pawns Ending XXI',
      fen: '8/7p/5k2/8/5K2/6P1/7P/8 w - - 0 1',
    },
    {
      name: 'Pawns Ending XXII',
      fen: '8/7p/8/5k2/8/5K2/6PP/8 b - - 0 1',
    },
    {
      name: 'Pawns Ending XXIII',
      fen: '8/6k1/6P1/p2p3P/8/8/2K5/8 b - - 0 1',
    },
    {
      name: 'Pawns Ending XXIV',
      fen: '8/6k1/6P1/p2p3P/8/8/2K5/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + Bishop I',
      fen: '3k4/4r3/3K4/3B4/8/8/8/5R2 b - - 0 1',
    },
    {
      name: 'Rook vs Rook + Bishop II',
      fen: '3k4/4r3/3K4/3B4/8/8/8/5R2 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns I',
      fen: '3k4/6R1/7r/2KP4/3P4/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns II',
      fen: '8/6p1/8/8/1R4pk/r7/6K1/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns III',
      fen: '6k1/1R6/5P1P/6K1/8/8/8/r7 b - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns IV',
      fen: '6k1/1R6/7P/5PK1/8/8/8/r7 b - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns V',
      fen: '8/6k1/R7/1r5P/5PK1/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns VI',
      fen: '8/5k2/7P/6R1/5PK1/8/8/1r6 b - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns VII',
      fen: '8/8/r5kP/6P1/1R3K2/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns VIII',
      fen: '8/8/r4kP1/5P2/1R3K2/8/8/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns IX',
      fen: '8/4r3/8/5K2/2Pk4/3P3R/8/8 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns X',
      fen: 'R7/P5k1/8/8/8/6P1/6K1/r7 w - - 0 1',
    },
    {
      name: 'Rook vs Rook + 2 Pawns XI',
      fen: 'R7/6k1/8/8/P6P/6K1/8/4r3 b - - 0 1',
    },
    {
      name: 'Pawns Ending XXV',
      fen: '8/7k/p3p1pP/6P1/8/2K5/8/8 w - - 0 1',
    },
    {
      name: 'Pawns Ending XXVI',
      fen: '8/7k/6pP/6P1/8/p1p5/8/1K6 b - - 0 1',
    },
    {
      name: 'Pawns Ending XXVII',
      fen: '8/8/8/1p2kPp1/6P1/4K3/8/8 b - - 0 1',
    },
    {
      name: 'Pawns Ending XXVIII',
      fen: '8/8/8/p3kPp1/6P1/4K3/8/8 w - - 0 1',
    },
    {
      name: 'Pawns Ending XXIX',
      fen: '8/8/2p1kPp1/6P1/4K3/8/8/8 w - - 0 1',
    },
    {
      name: 'Pawns Ending XXX',
      fen: '8/8/3k4/1p2p3/1P2K3/8/7P/8 w - - 0 1',
    },
    { name: 'Queen vs Rook', fen: '8/8/4r3/3k4/8/8/3K1Q2/8 w - - 0 1' },
  ];

  export default boardEditordata;