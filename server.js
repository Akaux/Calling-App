// Servidor de sinalização: só repassa mensagens entre os participantes.
// O áudio/vídeo trafega direto entre os navegadores (WebRTC).
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.static(__dirname + '/public'));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const peers = new Map(); // id -> { ws, name }
let counter = 0;
const send = (ws, msg) => ws.readyState === 1 && ws.send(JSON.stringify(msg));
const broadcast = (msg, exceptId) =>
  peers.forEach((p, id) => id !== exceptId && send(p.ws, msg));

wss.on('connection', (ws) => {
  const id = String(++counter);
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.type === 'join') {
      const name = String(m.name || 'Anônimo').slice(0, 24);
      peers.set(id, { ws, name });
      send(ws, {
        type: 'welcome', id,
        peers: [...peers].filter(([k]) => k !== id).map(([k, v]) => ({ id: k, name: v.name })),
      });
      broadcast({ type: 'peer-joined', id, name }, id);
    } else if (m.type === 'signal' && peers.has(id)) {
      const t = peers.get(m.to);
      if (t) send(t.ws, { type: 'signal', from: id, data: m.data });
    }
  });
  ws.on('close', () => {
    if (peers.delete(id)) broadcast({ type: 'peer-left', id });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Call rodando em http://localhost:' + PORT));
