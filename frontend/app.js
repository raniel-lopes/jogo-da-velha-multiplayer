const defaultApiBase = "https://backend-production-aa4bc.up.railway.app";

const apiBaseInput = document.getElementById("apiBase");
const matchIdInput = document.getElementById("matchIdInput");
const boardEl = document.getElementById("board");

const matchIdEl = document.getElementById("matchId");
const playerIdEl = document.getElementById("playerId");
const symbolEl = document.getElementById("symbol");
const turnEl = document.getElementById("turn");
const statusEl = document.getElementById("gameStatus");
const messageEl = document.getElementById("message");

const btnCreate = document.getElementById("btnCreate");
const btnJoin = document.getElementById("btnJoin");
const btnRefresh = document.getElementById("btnRefresh");

const state = {
    apiBase: localStorage.getItem("apiBase") || defaultApiBase,
    matchId: localStorage.getItem("matchId") || "",
    playerId: localStorage.getItem("playerId") || "",
    symbol: localStorage.getItem("symbol") || "",
    board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ]
};

apiBaseInput.value = state.apiBase;
matchIdInput.value = state.matchId;

function saveState() {
    localStorage.setItem("apiBase", state.apiBase);
    localStorage.setItem("matchId", state.matchId);
    localStorage.setItem("playerId", state.playerId);
    localStorage.setItem("symbol", state.symbol);
}

function setMessage(text) {
    messageEl.textContent = text;
}

function updateInfo() {
    matchIdEl.textContent = state.matchId || "-";
    playerIdEl.textContent = state.playerId || "-";
    symbolEl.textContent = state.symbol || "-";
}

function renderBoard() {
    boardEl.innerHTML = "";
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = document.createElement("button");
            cell.className = "cell";
            cell.textContent = state.board[row][col] || "";
            cell.addEventListener("click", () => handleMove(row, col));
            boardEl.appendChild(cell);
        }
    }
}

async function rpc(path, method = "GET", body) {
    if (!state.apiBase) {
        throw new Error("Informe a URL do backend.");
    }
    const response = await fetch(`${state.apiBase}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) {
        throw new Error(`Falha HTTP ${response.status}`);
    }
    return response.json();
}

async function createMatch() {
    try {
        state.apiBase = apiBaseInput.value.trim();
        const data = await rpc("/rpc/create", "POST");
        if (!data.success) {
            setMessage(data.message || "Nao foi possivel criar a partida.");
            return;
        }
        state.matchId = data.matchId;
        state.playerId = data.playerId;
        state.symbol = data.symbol;
        matchIdInput.value = state.matchId;
        updateInfo();
        saveState();
        setMessage(`Partida criada. Compartilhe o ID: ${state.matchId}`);
        await refreshState();
    } catch (error) {
        setMessage(error.message);
    }
}

async function joinMatch() {
    try {
        state.apiBase = apiBaseInput.value.trim();
        const typedMatchId = matchIdInput.value.trim();
        if (!typedMatchId) {
            setMessage("Informe o matchId para entrar.");
            return;
        }
        const data = await rpc("/rpc/join", "POST", { matchId: typedMatchId });
        if (!data.success) {
            setMessage(data.message || "Nao foi possivel entrar na partida.");
            return;
        }
        state.matchId = data.matchId;
        state.playerId = data.playerId;
        state.symbol = data.symbol;
        updateInfo();
        saveState();
        setMessage("Voce entrou na partida com sucesso.");
        await refreshState();
    } catch (error) {
        setMessage(error.message);
    }
}

async function refreshState() {
    try {
        state.apiBase = apiBaseInput.value.trim();
        if (!state.matchId) {
            setMessage("Crie ou entre em uma partida antes de atualizar.");
            return;
        }
        const data = await rpc(`/rpc/state/${state.matchId}`);
        if (!data.success) {
            setMessage(data.message || "Nao foi possivel obter o estado.");
            return;
        }
        state.board = data.board;
        turnEl.textContent = data.currentTurn || "-";
        statusEl.textContent = data.status || "-";
        if (data.winner) {
            setMessage(`Vencedor: ${data.winner}`);
        }
        if (data.status === "DRAW") {
            setMessage("Deu velha.");
        }
        renderBoard();
        saveState();
    } catch (error) {
        setMessage(error.message);
    }
}

async function handleMove(row, col) {
    try {
        if (!state.matchId || !state.playerId) {
            setMessage("Crie/entre em uma partida antes de jogar.");
            return;
        }
        const data = await rpc("/rpc/move", "POST", {
            matchId: state.matchId,
            playerId: state.playerId,
            row,
            col
        });
        setMessage(data.message || "Jogada processada.");
        if (data.state && data.state.board) {
            state.board = data.state.board;
            turnEl.textContent = data.state.currentTurn || "-";
            statusEl.textContent = data.state.status || "-";
            if (data.state.winner) {
                setMessage(`Vencedor: ${data.state.winner}`);
            }
            if (data.state.status === "DRAW") {
                setMessage("Deu velha.");
            }
            renderBoard();
        }
    } catch (error) {
        setMessage(error.message);
    }
}

btnCreate.addEventListener("click", createMatch);
btnJoin.addEventListener("click", joinMatch);
btnRefresh.addEventListener("click", refreshState);

updateInfo();
renderBoard();
