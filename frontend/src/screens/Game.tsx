import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useScoket"
import { useEffect, useState } from "react";
import { Chess } from "chess.js";

export const INIT_GAME: string = "init_game";
export const MOVE: string = "move";
export const GAME_OVER: string = "game_over";

export const Game = () => {
    const socket = useSocket();
    const [chess,setChess] = useState(new Chess());
    const [board,setBoard] = useState(chess.board());
    const [started,setStarted] = useState(false)

    useEffect(() => {
        if(!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch(message.type) {
                case INIT_GAME:
                    setStarted(true)
                    console.log("Game Initialized")
                    break;
                case MOVE:
                    const move = message.payload;
                    chess?.move(move);
                    setBoard(chess?.board());
                    console.log("Move made by the opponent")
                    break;
                case GAME_OVER:
                    console.log("Game is over!")
                    break;
            }
        }
    },[socket])

    return (
        <div className="h-screen">
            <div className="flex flex-col items-center justify-center p-10">
                    <div>
                        {!started && <button onClick={() => {
                            socket?.send(JSON.stringify({
                                type: INIT_GAME
                            }))
                        }} className="bg-green-500 hover:bg-green-700 text-white font-bold text-xl rounded py-6 px-10">
                            Find an Opponent
                        </button> }
                    </div>
                    <div className="mt-15">
                        <ChessBoard chess={chess} setBoard={setBoard} board={board} socket={socket}/>
                    </div>
            </div>
        </div>
    )
}