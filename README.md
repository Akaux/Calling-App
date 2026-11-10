# Sala de Call

Uma sala de voz única, no estilo Discord, com compartilhamento de tela. Todo mundo que abre o site entra na mesma call, vê as telas compartilhadas e conversa por voz.

O áudio e o vídeo passam direto entre os navegadores (WebRTC). O servidor só ajuda os participantes a se encontrarem.

## O que tem

- Uma única call para todos, com entrada por nome
- Lista de quem está na call
- Compartilhamento de tela, com várias pessoas transmitindo ao mesmo tempo
- Som do sistema ou da aba junto com a tela
- Volume individual de cada tela e botão de tela cheia
- Configurações de microfone: dispositivo, volume (0 a 200%), cancelamento de eco, supressão de ruído e ganho automático
- Configurações de saída: dispositivo e volume geral
- Configurações da transmissão: resolução, FPS, qualidade (bitrate) e modo de otimização

## Estrutura do projeto

```
call-room/
├── server.js        servidor (Express + WebSocket)
├── package.json     dependências
├── README.md
└── public/
    └── index.html   a interface
```

O `index.html` precisa ficar dentro da pasta `public`.

## Rodar no seu computador

1. Instale o Node.js (versão LTS) em https://nodejs.org
2. No terminal, entre na pasta do projeto e instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   node server.js
   ```
4. Abra http://localhost:3000 no navegador.

Para testar sozinho, abra uma segunda aba, entre com outro nome e compartilhe a tela em uma delas.

## Colocar online no Render

Para outras pessoas entrarem, o site precisa de um endereço com HTTPS.

1. Envie o projeto para um repositório no GitHub, com `server.js` e `package.json` na raiz e o `index.html` em `public/`.
2. No Render, clique em **New +** e escolha **Web Service**. Não use "Static Site", ele não executa o servidor.
3. Conecte o repositório e preencha:
   - **Language:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Root Directory:** vazio (só preencha se o `package.json` estiver dentro de uma subpasta)
4. Clique em **Create Web Service** e espere o status ficar **Live**.
5. Compartilhe o link `https://...onrender.com` com quem vai entrar.

No plano grátis, o servidor dorme quando fica parado. O primeiro acesso depois disso pode levar cerca de 1 minuto, e a tela de entrada mostra "Servidor acordando…" enquanto isso.

## Como usar

1. Abra o link, digite seu nome e clique em **Entrar na call**.
2. Quando o navegador pedir o microfone, clique em **Permitir**. Sem a permissão, você entra só ouvindo.
3. Clique em **Compartilhar tela** e escolha uma tela inteira, uma janela ou uma aba.
4. Para silenciar seu microfone, clique em **Microfone**.
5. Abra **Configurações** para ajustar o som e a qualidade da transmissão.
6. Para sair, clique em **Sair**.

### Dicas para a transmissão

- **Jogos e vídeos:** use o modo "Movimento", 1080p e 30 ou 60 FPS.
- **Texto e código:** use o modo "Nitidez".
- **Internet com upload fraco:** reduza a resolução, o FPS ou o bitrate. Cada espectador recebe um fluxo separado da sua tela.
- **Som do sistema:** deixe "Enviar o som do sistema/aba" marcado antes de compartilhar. Ao escolher uma aba no Chrome ou no Edge, marque também a opção de compartilhar o áudio da aba.
- Resolução, FPS e som do sistema valem na próxima vez que você compartilhar. A qualidade (bitrate) vale na hora.
- O navegador mostra uma barra avisando que a tela está sendo compartilhada. Ela é um aviso de segurança e não pode ser removida pelo site. No Chrome e no Edge dá para clicar em **Ocultar**.

## Limites

- A conexão é de todos com todos, então funciona bem para cerca de 4 a 6 pessoas.
- Em algumas redes restritivas (operadoras e redes corporativas), a conexão direta pode falhar. Nesse caso é preciso adicionar um servidor TURN.
- Use Chrome, Edge ou Brave. O som do sistema não funciona no Firefox nem no Safari.
- O compartilhamento de tela e o microfone só funcionam em HTTPS ou em `localhost`.

## Problemas comuns

| Problema | O que fazer |
| --- | --- |
| `Cannot GET /` | O `index.html` não está em `public/`. Confira a estrutura de pastas e reinicie o servidor. |
| A tela de entrada fica parada | No Render grátis, aguarde o servidor acordar. Confira se o serviço é um **Web Service**. |
| `WebSocket connection failed` no console | O `server.js` não está rodando. Veja a aba **Logs** do Render e o Start Command. |
| Ninguém me ouve | Libere o microfone no ícone da barra de endereço e confira o dispositivo em Configurações. |
| Não ouço o som da tela de outra pessoa | Peça para ela marcar "Enviar o som do sistema/aba" e compartilhar a tela de novo. |
| Não consigo ver a tela de alguém | Pode ser bloqueio de rede. Teste em outra internet ou adicione um servidor TURN. |
