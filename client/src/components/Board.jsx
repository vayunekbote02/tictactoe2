import Square from "./Square";

function Board({ squares, onSquareClick, winningLine, indexToFade }) {
  const renderSquare = (i) => {
    const isWinning = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => onSquareClick(i)}
        isWinning={isWinning}
        shouldFade={indexToFade === i}
      />
    );
  };

  const boardSquares = squares.map((_, i) => renderSquare(i));

  return (
    <div className="grid grid-cols-3 gap-0 border-collapse">{boardSquares}</div>
  );
}

export default Board;
