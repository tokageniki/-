import { useState } from "react";
import "./styles.css";

type SquareValue = "X" | "O" | null;

type SquareProps = {
  value: SquareValue;
  onSquareClick: () => void;
  isWinning: boolean;
};

type BoardProps = {
  xIsNext: boolean;
  squares: ReadonlyArray<SquareValue>;
  onPlay: (nextSquares: SquareValue[]) => void;
};

type WinnerResult = {
  winner: "X" | "O";
  line: readonly [number, number, number];
} | null;


function Square({ value, onSquareClick, isWinning }: SquareProps) {
  return (
    <button
      onClick={onSquareClick}
      className={`
        bg-red-500
        w-16 h-16
        border border-gray-400
        text-2xl font-bold
        inline-flex items-center justify-center
        transition-all duration-300
        ${
          isWinning
            ? "bg-yellow-300 border-yellow-500 scale-110 shadow-lg"
            : "bg-white hover:bg-gray-100"
        }
      `}
    >
      {value}
    </button>
  );
}


function Board({ xIsNext, squares, onPlay }: BoardProps) {
  const winnerResult = calculateWinner(squares);
  const isDraw =!winnerResult && squares.every((square) => square !== null);
  const winningLine: readonly number[] = winnerResult?.line ?? [];

  function handleClick(i: number) {
    if (winnerResult || squares[i]) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const status = winnerResult
    ? `Winner: ${winnerResult.winner}`
    : isDraw
    ? "Draw!"
    : `Next player: ${xIsNext ? "X" : "O"}`;

  return (
    <>
      <div className="mb-2 font-bold">{status}</div>

      {[0, 1, 2].map((row) => (
        <div key={row} className="flex">
          {[0, 1, 2].map((col) => {
            const index = row * 3 + col;
            return (
              <Square
                key={index}
                value={squares[index]}
                onSquareClick={() => handleClick(index)}
                isWinning={winningLine.includes(index)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

function getMovePosition(
  prev: SquareValue[],
  current: SquareValue[]
): { row: number; col: number } | null {
  for (let i = 0; i < 9; i++) {
    if (prev[i] !== current[i]) {
      return {
        row: Math.floor(i / 3),
        col: i % 3,
      };
    }
  }
  return null;
}

export default function App() {
  const [history, setHistory] = useState<SquareValue[][]>([
    Array(9).fill(null),
  ]);
  const [currentMove, setCurrentMove] = useState(0);

  const [isAscending, setIsAscending] = useState(true);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: SquareValue[]) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      nextSquares,
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

const moves = history
  .map((_, move) => move)
  .slice()
  .sort((a, b) => (isAscending ? a - b : b - a))
  .map((move) => {
    let description = "Go to game start";

    if (move > 0) {
      const position = getMovePosition(
        history[move - 1],
        history[move]
      );

      if (position) {
        description = `Go to move #${move} (row: ${position.row + 1}, col: ${position.col + 1})`;
      }
    }
    return (
      <li key={move}>
        {move === currentMove ? (
          <span>Move #{move}</span>
        ) : (
          <button
            onClick={() => jumpTo(move)}
            className="
              w-full
              px-3 py-1
              text-sm
              border border-gray-300
              rounded
              bg-white
              hover:bg-gray-100
              hover:border-gray-400
              transition
            "
          >
            {description}
          </button>
        )}
      </li>
    );
  });

  return (
    <div className="game flex gap-4">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
        />
      </div>
      <div className="game-info">
        <button
          onClick={() => setIsAscending(!isAscending)}
          className="
            mb-2
            px-3 py-1
            text-sm
            border border-gray-300
            rounded
            bg-white
            hover:bg-gray-100
            transition
          "
        >
          Sort: {isAscending ? "Ascending" : "Descending"}
        </button>

        <ol>{moves}</ol>
      </div>
    </div>
  );
}





function calculateWinner(
  squares: ReadonlyArray<SquareValue>
): WinnerResult {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ] as const;

  for (const [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return {
        winner: squares[a],
        line: [a, b, c],
      };
    }
  }
  return null;
}


