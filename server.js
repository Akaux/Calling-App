// Servidor de sinalização: só repassa mensagens entre os participantes.
// O áudio/vídeo trafega direto entre os navegadores (WebRTC).
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const fs = require('fs');
const path = require('path');

const app = express();
const dirs = [path.join(__dirname, 'public'), path.join(__dirname, 'src', 'public')];
const publicDir = dirs.find((d) => fs.existsSync(path.join(d, 'index.html')));
if (publicDir) {
  console.log('Servindo arquivos de:', publicDir);
  app.use(express.static(publicDir));
} else if (fs.existsSync(path.join(__dirname, 'index.html'))) {
  console.log('index.html encontrado na raiz do projeto');
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
} else {
  const ls = (d) => { try { return fs.readdirSync(d).join(', '); } catch { return '(não existe)'; } };
  const msg = `index.html não encontrado.\nPasta do servidor: ${__dirname}\nArquivos aqui: ${ls(__dirname)}\nArquivos em public: ${ls(path.join(__dirname, 'public'))}`;
  console.log(msg);
  app.get('/', (req, res) => res.type('text').send(msg));
}
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