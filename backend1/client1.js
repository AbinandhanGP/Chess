import { WebSocket } from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open",() => {
    ws.send(JSON.stringify({
        type: "init_game"
    }));
})

ws.on("message",(data) => {
    console.log("Recieved:",data.toString());
    ws.send(JSON.stringify({
        type: "move",
        move: {
            from: "a2",
            to: "a3"
        }
    }));
})

ws.onope
