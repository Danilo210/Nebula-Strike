# NEBULA STRIKE — Infinite Horizon

Jogo original arcade de nave espacial, inspirado no gênero clássico de shooters horizontais.

## Recursos
- Campanha de cinco fases, cada uma encerrada por um chefe.
- Modo infinito com chefe a cada 60 segundos, dificuldade crescente.
- Pontuação, combo, power-ups, escudo, vidas, partículas e som sintetizado.
- Ranking público separado por modo, servido por API Node.js.
- Controles de teclado e toque (arrastar a nave para movimentar e atirar, ou usar DISPARAR).

## Rodar localmente
Instale Node.js 18 ou superior. No diretório do projeto:

```bash
npm start
```

Abra http://localhost:3000.

## Publicar no Render
1. Envie os arquivos para um repositório GitHub.
2. No Render, crie **Web Service** com runtime **Node**.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Para preservar o ranking após reinícios/deploys, configure um disco persistente montado em `/var/data` e a variável `DATA_DIR=/var/data` (discos persistentes podem exigir plano pago). Sem disco, o ranking é salvo localmente no servidor e pode ser perdido em novos deploys ou reinícios.

## Importante sobre ranking
O servidor valida formato e sessão, mas não verifica a simulação da partida: pontuações podem ser falsificadas por clientes maliciosos. Para um ranking competitivo de produção, use simulação autoritativa no servidor ou replay verificável, autenticação, limites por usuário e banco de dados persistente (por exemplo, Postgres). O arquivo JSON é adequado a um MVP com uma única instância.

## Direitos
Jogo original. Não utiliza marcas, imagens, músicas nem código de jogos comerciais.
