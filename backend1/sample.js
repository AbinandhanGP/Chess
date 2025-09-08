import { WebSocketServer } from "ws";
import { Chess } from "chess.js";

const wss = new WebSocketServer({ port:8080 });
const games = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch(e) { ws.send(JSON.stringify({type:'error',message:'bad json'})); return;}
    // Basic routing
    if (data.type === 'create') {
      const gameId = Math.random().toString(36).slice(2,9);
      const chess = new Chess();
      const game = { chess, sockets: new Set([ws]), players: {}, id: gameId, createdAt: Date.now() };
      game.players.w = ws; // creator white by default; you can randomize
      ws.gameId = gameId;
      ws.color = 'w';
      games.set(gameId, game);
      ws.send(JSON.stringify({type:'game_created', gameId, color:'w'}));
      ws.send(JSON.stringify({type:'state', fen:chess.fen(), pgn:chess.pgn(), turn:chess.turn(), gameOver:chess.game_over || false}));
      return;
    }

    if (data.type === 'join') {
      const game = games.get(data.gameId);
      if (!game) return ws.send(JSON.stringify({type:'error', message:'game not found'}));
      game.sockets.add(ws);
      // assign color if open
      if (!game.players.b) { game.players.b = ws; ws.color = 'b'; }
      ws.gameId = data.gameId;
      ws.send(JSON.stringify({type:'joined', gameId:data.gameId, color:ws.color}));
      // send state
      ws.send(JSON.stringify({type:'state', fen:game.chess.fen(), pgn:game.chess.pgn(), turn:game.chess.turn(), gameOver:game.chess.game_over || false}));
      // broadcast player joined
      broadcast(game, {type:'player_joined', color: ws.color});
      return;
    }

    if (data.type === 'move') {
      const game = games.get(ws.gameId);
      if (!game) return ws.send(JSON.stringify({type:'error', message:'not in game'}));
      const chess = game.chess;
      // server-side turn enforcement
      if (chess.turn() !== ws.color) {
        return ws.send(JSON.stringify({type:'move_rejected', reason:'not_your_turn'}));
      }
      // attempt move
      const move = chess.move({ from: data.from, to: data.to, promotion: data.promotion || 'q' });
      if (move === null) {
        return ws.send(JSON.stringify({type:'move_rejected', reason:'illegal'}));
      }
      // move accepted => broadcast new state
      const state = { type:'state', fen: chess.fen(), pgn: chess.pgn(), lastMove: move, turn: chess.turn() };
      broadcast(game, state);

      // check game-over conditions
      if (chess.in_checkmate()) {
        broadcast(game, {type:'game_over', reason:'checkmate', winner: (chess.turn() === 'w' ? 'b' : 'w')});
      } else if (chess.in_stalemate()) {
        broadcast(game, {type:'game_over', reason:'stalemate', winner: null});
      } else if (chess.insufficient_material()) {
        broadcast(game, {type:'game_over', reason:'insufficient_material', winner: null});
      } else if (chess.in_threefold_repetition()) {
        broadcast(game, {type:'game_over', reason:'threefold_repetition', winner: null});
      } else if (chess.in_draw()) {
        broadcast(game, {type:'game_over', reason:'draw', winner: null});
      }
      return;
    }

    if (data.type === 'resign') {
      const game = games.get(ws.gameId);
      if (!game) return;
      const winner = ws.color === 'w' ? 'b' : 'w';
      broadcast(game, {type:'game_over', reason:'resign', winner});
      return;
    }

    // add other commands: offer_draw, accept_draw, clock ticks, undo request, etc.
  });

  ws.on('close', () => {
    // leaving socket — optionally remove from games, mark disconnected player
    // keep game alive for reconnection
  });
});

console.log('WS server running on :8080');