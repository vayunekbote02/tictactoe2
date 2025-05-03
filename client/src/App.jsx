import { useEffect, useState } from "react";
import Board from "./components/Board";
import { calculateWinner, isEven } from "./functions";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function Game() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [moveCount, setMoveCount] = useState(0);
  const xIsNext = moveCount % 2 === 0;
  const [room, setRoom] = useState("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [socket, setSocket] = useState(null);
  const [role, setRole] = useState(null);
  const [canStart, setCanStart] = useState(false);

  const { winner, line: winningLine } = calculateWinner(squares);

  // For dev testing
  // const backendURL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  // Connect to socket event
  useEffect(() => {
    const newSocket = io("https://tictactoe2-yk8j.onrender.com/"); //for prod
    // const newSocket = io(backendURL); // for dev testing
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join room event
  useEffect(() => {
    if (socket) {
      socket.on("room_full", (room) => {
        toast.error(`Room ${room} is full. Please join another room.`);
      });
    }

    return () => {
      if (socket) {
        socket.off("room_full");
      }
    };
  }, [socket]);

  // Game start event
  useEffect(() => {
    if (socket) {
      socket.on("game_start", () => {
        setCanStart(true);
        role === "X" &&
          toast("Opponent joined", {
            icon: "😁",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
      });
    }

    return () => {
      if (socket) {
        socket.off("game_start");
      }
    };
  }, [socket, role]);

  // Update board on each move event
  useEffect(() => {
    if (socket && hasJoinedRoom) {
      socket.on("move_broadcasted", (board_array) => {
        setSquares(board_array);
        setMoveCount((prevCount) => prevCount + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off("move_broadcasted");
      }
    };
  }, [socket, hasJoinedRoom]);

  // Opponent left event
  useEffect(() => {
    if (socket) {
      socket.on("opponent_left", () => {
        setCanStart(false); // Stop the game
        toast("Opponent left", {
          icon: "😔",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        setSquares(Array(9).fill(null));
        setMoveCount(0);
        if (role === "O") {
          setRole("X");
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("opponent_left");
      }
    };
  }, [socket, role]);

  // Restart game event
  useEffect(() => {
    if (socket && hasJoinedRoom) {
      socket.on("game_restarted", () => {
        setSquares(Array(9).fill(null));
        setMoveCount(0);
      });
    }

    return () => {
      if (socket) {
        socket.off("game_restarted");
      }
    };
  }, [socket, hasJoinedRoom]);

  // Condition for fading the square
  let indexToFade = null;
  if (moveCount > 5) {
    const nextSquares = squares.slice();
    indexToFade = nextSquares.findIndex((element) => element === moveCount - 6);
  }

  // Confition for removing the play
  if (moveCount > 6) {
    const nextSquares = squares.slice();
    const indexToRemove = nextSquares.findIndex(
      (element) => element === moveCount - 7
    );

    if (indexToRemove !== -1) {
      nextSquares[indexToRemove] = null;
      setSquares(nextSquares);
    }
  }

  let status;
  let fadeMessage = "";
  if (winner !== null) {
    status = `Winner: ${isEven(winner) ? "X" : "O"}`;
  } else if (squares.every((sq) => sq !== null)) {
    status = "Draw!";
  } else {
    if (indexToFade !== null) {
      fadeMessage = `Fading square at index: ${indexToFade + 1}`;
    }
    if (!hasJoinedRoom) {
      status = "Please join a room";
    } else if (!canStart) {
      status = "Waiting for opponent to join...";
    } else if ((xIsNext && role === "X") || (!xIsNext && role === "O")) {
      status = "Your Turn";
    } else {
      status = "Opponent's Turn";
    }
  }

  const handleSquareClick = (i) => {
    if (canStart && ((xIsNext && role === "X") || (!xIsNext && role === "O"))) {
      if (squares[i] || winner || i === indexToFade) {
        return;
      }

      const nextSquares = squares.slice();
      nextSquares[i] = moveCount;

      setSquares(nextSquares);
      setMoveCount(moveCount + 1);

      if (socket && hasJoinedRoom) {
        socket.emit("move_made", { room, board_array: nextSquares });
      }
    }
    return;
  };

  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setMoveCount(0);

    if (socket && hasJoinedRoom) {
      socket.emit("restart_game", room);
    }
  };

  const joinRoom = () => {
    if (socket) {
      socket.emit("join_room", room);
      socket.on("room_joined", ({ room, role }) => {
        setHasJoinedRoom(true);
        setRoom(room);
        setRole(role);
      });
      toast.success(`Joined room: ${room}`, {
        icon: "✅",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg shadow-md font-sans">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Tic Tac Toe ♾️</h1>
      <div className="flex flex-col mb-4 text-xl font-semibold text-gray-700 min-h-[1.5em] text-center">
        <span>{fadeMessage}</span>
        <span>{status}</span>
      </div>{" "}
      <div className="game-board mb-6">
        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          winningLine={winningLine}
          indexToFade={indexToFade}
        />
      </div>
      {winner !== null && (
        <div className="game-info mt-4">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out font-semibold"
          >
            Restart Game
          </button>
        </div>
      )}
      {hasJoinedRoom ? (
        <div className="mt-4 text-lg font-semibold text-gray-700">
          You have joined room: {room}
        </div>
      ) : (
        <div className="mt-4 flex items-baseline gap-3">
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
            className="mb-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 "
          />
          <button
            onClick={joinRoom}
            className="p-3 bg-teal-500 text-white rounded-2xl cursor-pointer shadow hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-150 ease-in-out font-semibold"
          >
            Join Room
          </button>
        </div>
      )}
    </div>
  );
}
