import { useNavigate } from "react-router-dom"

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex justify-center mt-20">
                    <img className="max-w-140" src="chessboard.png" alt="An image of a chess board" />
                </div>
                <div className="flex justify-center flex-col items-align">
                    <h1 className="text-4xl text-white font-bold pl-18 pb-6">Welcome to the Arena</h1>
                    <div className="mt-4 px-20">
                        <button onClick={() => navigate("/game")} className="bg-green-500 hover:bg-green-700 text-white font-bold rounded py-4 px-8">
                            <div className="text-2xl font-bold">
                            Play Online 
                            </div>
                            <div className="text-sm font-normal">
                            Play with a random player from all around globe 
                            </div>
                        </button>
                        <br></br>
                        <button onClick={() => navigate("")} className="bg-green-500 hover:bg-green-700 text-white font-bold rounded py-4 px-14 mt-6">
                            <div className="text-2xl font-bold">
                            Create your own lobby
                            </div>
                            <div className="text-sm font-normal">
                            Play with your friends in a private lobby 
                            </div>
                        </button>

                    </div>
                </div>

            </div>
        </div>
    )
}