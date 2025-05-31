import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';

const WINNING_COMBINATIONS = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

// 🎯 Generate a real Bingo card (B:1–15, I:16–30, ..., O:61–75)
const generateBingoCard = (): number[] => {
  const ranges = [
    Array.from({ length: 15 }, (_, i) => i + 1),
    Array.from({ length: 15 }, (_, i) => i + 16),
    Array.from({ length: 15 }, (_, i) => i + 31),
    Array.from({ length: 15 }, (_, i) => i + 46),
    Array.from({ length: 15 }, (_, i) => i + 61),
  ];

  const card: number[] = [];

  for (const range of ranges) {
    for (let i = range.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [range[i], range[j]] = [range[j], range[i]];
    }
    card.push(...range.slice(0, 5));
  }

  card[12] = 0; // Free space at the center
  return card;
};

const BingoGame = () => {
  const [playerBoards, setPlayerBoards] = useState([generateBingoCard(), generateBingoCard()]);
  const [markedCells, setMarkedCells] = useState<number[][]>([[12], [12]]);
  const [drawPool, setDrawPool] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [winner, setWinner] = useState<number | null>(null);

  const clickSound = new Audio('/sounds/click.mp3');
  const winSound = new Audio('/sounds/win.mp3');

  // 🎯 Generate the draw pool on first load
  useEffect(() => {
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setDrawPool(numbers);
  }, []);

  const checkWin = (selected: number[]) => {
    return WINNING_COMBINATIONS.some(comb => comb.every(index => selected.includes(index)));
  };

  const handleDraw = () => {
    if (winner !== null || drawPool.length === 0) return;

    const [nextNumber, ...rest] = drawPool;
    clickSound.play();
    setDrawnNumbers([...drawnNumbers, nextNumber]);
    setDrawPool(rest);

    const newMarks = playerBoards.map((board, i) => {
      const selections = [...markedCells[i]];
      board.forEach((num, index) => {
        if (num === nextNumber && !selections.includes(index)) {
          selections.push(index);
        }
      });
      return selections;
    });

    setMarkedCells(newMarks);

    newMarks.forEach((marks, index) => {
      if (checkWin(marks) && winner === null) {
        setWinner(index);
        winSound.play();
      }
    });
  };

  const resetGame = () => {
    setPlayerBoards([generateBingoCard(), generateBingoCard()]);
    setMarkedCells([[12], [12]]);
    setDrawnNumbers([]);
    setWinner(null);
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setDrawPool(numbers);
  };

  const renderBoard = (board: number[], selections: number[], playerIndex: number) => (
    <Box>
      <Typography variant="h6" gutterBottom>Player {playerIndex + 1}</Typography>
      <Grid container spacing={1} sx={{ maxWidth: 300 }}>
        {board.map((num, index) => (
          <Grid
            item
            xs={2.4}
            key={index}
            sx={{
              padding: 2,
              backgroundColor: selections.includes(index) ? 'green' : 'lightgray',
              color: selections.includes(index) ? 'white' : 'black',
              textAlign: 'center',
              borderRadius: 1,
              userSelect: 'none'
            }}
          >
            {index === 12 ? 'FREE' : num}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box textAlign="center" p={2}>
      <Typography variant="h4" gutterBottom>Real Bingo Multiplayer</Typography>
      <Button variant="contained" color="secondary" onClick={handleDraw} disabled={winner !== null || drawPool.length === 0}>
        🎱 Draw Number
      </Button>
      <Typography mt={2}>Drawn: {drawnNumbers.join(', ')}</Typography>

      <Box display="flex" justifyContent="space-around" mt={4} flexWrap="wrap" gap={4}>
        {renderBoard(playerBoards[0], markedCells[0], 0)}
        {renderBoard(playerBoards[1], markedCells[1], 1)}
      </Box>

      <Box mt={4}>
        {winner !== null ? (
          <Typography variant="h5" color="success.main">
            🎉 Player {winner + 1} wins!
          </Typography>
        ) : (
          <Typography>👆 Draw a number to continue...</Typography>
        )}
        <Button variant="contained" onClick={resetGame} sx={{ mt: 2 }}>
          🔄 Reset Game
        </Button>
      </Box>
    </Box>
  );
};

export default BingoGame;
