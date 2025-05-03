function Square({ value, onSquareClick, isWinning, shouldFade }) {
  const isX = value % 2 === 0;
  const valueClass = shouldFade
    ? "text-gray-400"
    : isX
    ? "text-blue-500"
    : "text-red-500";
  const fadingClass = shouldFade
    ? "bg-gray-300 text-gray-400 cursor-not-allowed"
    : "";
  const winningClass = isWinning
    ? "bg-green-200"
    : "bg-white hover:bg-gray-100";

  return (
    <button
      className={`w-20 h-20 md:w-24 md:h-24 border border-gray-400 float-left text-4xl font-bold leading-tight text-center ${valueClass} ${winningClass} ${fadingClass} transition duration-150 ease-in-out ${
        value || shouldFade ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={!shouldFade ? onSquareClick : undefined}
    >
      {value !== null ? (isX ? "X" : "O") : ""}
    </button>
  );
}

export default Square;
