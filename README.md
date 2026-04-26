# Jogo da Velha Multiplayer (Frontend Vercel + Backend Railway)

Projeto academico em Java com arquitetura simples para navegador:

- Backend Java no Railway.
- API HTTP para o frontend.
- RMI interno no backend (requisito da disciplina mantido).
- Frontend estatico na Vercel.
- Estado da partida em memoria (sem banco).

## Arquitetura

1. A interface remota `RemoteTicTacToeService` define as operacoes do jogo.
2. O backend sobe o registry RMI e publica `TicTacToeService` internamente.
3. O gateway HTTP expoe rotas `/rpc/*` para o navegador.
4. O frontend na Vercel consome a URL publica do Railway.

## Estrutura

```
.
├── frontend/
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   └── vercel.json
├── src/main/java/com/jdv/
│   ├── Main.java
│   ├── http/HttpGateway.java
│   ├── client/ConsoleClient.java
│   ├── service/Match.java
│   ├── service/TicTacToeServiceImpl.java
│   └── shared/
│       ├── RemoteTicTacToeService.java
│       └── dto/*.java
└── pom.xml
```

## Executar localmente

Pre-requisitos:

- Java 17+
- Maven 3.9+

### 1) Build

```bash
mvn clean package
```

Ou usando script:

```powershell
.\build.ps1
```

### 2) Iniciar backend (HTTP + RMI)

```bash
java -jar target/jogo-da-velha-rmi-1.0.0.jar
```

Ou usando script:

```powershell
.\run-server.ps1
```

Servidor padrao em `127.0.0.1:1099`, servico `TicTacToeService`.
Gateway HTTP local em `http://localhost:8080`.

### 3) Teste rapido da API

Abra no navegador:

- `http://localhost:8080/`
- `http://localhost:8080/health`

### Rotas da API para frontend

- `POST /rpc/create`
- `POST /rpc/join`
- `POST /rpc/move`
- `GET /rpc/state/:matchId`

## Deploy do backend no Railway

1. Crie um projeto no Railway apontando para este repositorio.
2. Root Directory: deixe vazio ou use `.`.
3. O Railway vai detectar o `Dockerfile` na raiz e construir a imagem.
4. Variaveis de ambiente:
   - `PORT` (Railway injeta automaticamente)
   - `RMI_PORT=1099` (opcional)
   - `RMI_HOST=127.0.0.1` (pode manter assim neste caso)

Depois valide:

- `https://SEU-BACKEND.up.railway.app/health`

## Deploy do frontend na Vercel

1. Importe o repositorio na Vercel.
2. Em Root Directory, selecione `frontend`.
3. Framework preset: `Other`.
4. Build command: vazio.
5. Output directory: `.`
6. Deploy.

Depois de subir, abra o frontend e no campo "URL do backend" informe:

- `https://SEU-BACKEND.up.railway.app`

## Cliente Java opcional (apresentacao tecnica de RMI)

Se quiser demonstrar o uso direto de RMI em Java na apresentacao, voce ainda pode usar o cliente de console.

### Cliente 1 (cria partida)

```bash
java -cp target/jogo-da-velha-rmi-1.0.0.jar com.jdv.client.ConsoleClient 127.0.0.1 1099 TicTacToeService
```

Ou usando script:

```powershell
.\run-client.ps1
```

No cliente 1:

1. Escolha opcao `1` (Criar partida)
2. Copie o `Match ID`

### Cliente 2 (entra na partida)

```bash
java -cp target/jogo-da-velha-rmi-1.0.0.jar com.jdv.client.ConsoleClient 127.0.0.1 1099 TicTacToeService
```

Ou usando script:

```powershell
.\run-client.ps1
```

No cliente 2:

1. Escolha opcao `2` (Entrar em partida)
2. Cole o `Match ID`

## Observacao importante

Para acesso via navegador, o frontend usa HTTP (`/rpc/*`). O RMI continua sendo usado internamente no backend Java.