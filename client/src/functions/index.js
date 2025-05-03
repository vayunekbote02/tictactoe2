function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (
      squares[a] !== null &&
      isEven(squares[a]) &&
      isEven(squares[b]) &&
      isEven(squares[c])
    ) {
      return { winner: squares[a], line: lines[i] };
    }
    if (
      squares[a] !== null &&
      isOdd(squares[a]) &&
      isOdd(squares[b]) &&
      isOdd(squares[c])
    ) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
}

function isOdd(num) {
  return num !== null && num % 2 !== 0;
}

function isEven(num) {
  return num !== null && num % 2 === 0;
}

export { calculateWinner, isOdd, isEven };
