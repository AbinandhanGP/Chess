import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({chess,setBoard,board,socket}: {
    chess:any,
    setBoard:any,
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][],
    socket:WebSocket | null
}) => {
    const [from,setFrom] = useState<null | Square>(null);

    return (
        <div>
            {board.map((row,i) => {
                return <div key={i} className="flex">
                    {row.map((square,j) => {
                        const squareRepresentation = String.fromCharCode(97 + (j%8)) + "" + (8 - i) as Square;
                        console.log(squareRepresentation)
                        return <div onClick={() => {
                            if(!from) {
                                setFrom(squareRepresentation)
                            }else {
                                socket?.send(JSON.stringify({
                                    type:MOVE,
                                    payload: {
                                        move: {
                                            from,
                                            to:squareRepresentation                                        }
                                    }
                                }))
                                chess.move({
                                    from,
                                    to:squareRepresentation                                    });
                                console.log("Success");
                                setBoard(chess.board());
                                setFrom(null);
                            }
                        }} key={j} className={`h-20 w-20 ${((i+j)%2 == 0)?'bg-[#769656]':'bg-[#EEEED2]'}`}>
                            {square? <img src={`/${square?.color === 'b' ? square?.type.toUpperCase():square?.type}.png`} />:""}
                        </div>
                    })}
                </div>
            })}
        </div>
    )
}