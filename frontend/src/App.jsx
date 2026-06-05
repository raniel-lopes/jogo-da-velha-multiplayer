import React, { useEffect, useMemo, useState } from 'react'
import Board from './components/Board'

const STORAGE_KEYS = {
  matchId: 'matchId',
  playerId: 'playerId',
  symbol: 'symbol'
}

const defaultBoard = () => ([['', '', ''], ['', '', ''], ['', '', '']])

const detectApiBase = () => {
  try {
    const host = location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8080'
  } catch (error) {}
  return 'https://jogo-da-velha-multiplayer-production.up.railway.app'
}

const readStored = (key) => localStorage.getItem(STORAGE_KEYS[key]) || ''

const statItems = [
  { key: 'match', label: 'MATCH' },
  { key: 'player', label: 'PLAYER' },
  { key: 'symbol', label: 'SYMBOL' },
  { key: 'turn', label: 'TURN' }
]

export default function App() {
  const apiBase = useMemo(() => detectApiBase(), [])
  const [matchId, setMatchId] = useState(readStored('matchId'))
  const [playerId, setPlayerId] = useState(readStored('playerId'))
  const [symbol, setSymbol] = useState(readStored('symbol'))
  const [board, setBoard] = useState(defaultBoard())
  const [turn, setTurn] = useState('-')
  const [status, setStatus] = useState('WAITING')
  const [message, setMessage] = useState('Conecte uma partida para iniciar.')
  const [busy, setBusy] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('---')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.matchId, matchId)
    localStorage.setItem(STORAGE_KEYS.playerId, playerId)
    localStorage.setItem(STORAGE_KEYS.symbol, symbol)
  }, [matchId, playerId, symbol])

  const rpc = async (path, method = 'GET', body) => {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const detail = data.message || `Falha HTTP ${response.status}`
      throw new Error(detail)
    }
    return data
  }

  const syncState = async (targetMatchId = matchId, { silent = false } = {}) => {
    if (!targetMatchId) {
      if (!silent) {
        setMessage('Crie ou entre em uma partida primeiro.')
      }
      return
    }

    const data = await rpc(`/rpc/state/${targetMatchId}`)
    if (!data.success) {
      throw new Error(data.message || 'Nao foi possivel carregar a partida.')
    }

    setBoard(data.board || defaultBoard())
    setTurn(data.currentTurn || '-')
    setStatus(data.status || 'UNKNOWN')
    if (data.winner) {
      setMessage(`Vencedor: ${data.winner}`)
    } else if (!silent) {
      setMessage(data.message || 'Sincronizado.')
    }
    setLastUpdated(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    if (!matchId) return

    let cancelled = false
    const poll = async () => {
      try {
        await syncState(matchId, { silent: true })
      } catch (error) {
        if (!cancelled) {
          // Mantem a mensagem atual em falhas de sincronizacao automatica.
        }
      }
    }

    poll()
    const intervalId = setInterval(poll, 2000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [matchId])

  const runAction = async (action) => {
    setBusy(true)
    try {
      await action()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  const createMatch = async () => runAction(async () => {
    const data = await rpc('/rpc/create', 'POST')
    if (!data.success) throw new Error(data.message || 'Nao foi possivel criar a partida.')

    setMatchId(data.matchId)
    setPlayerId(data.playerId)
    setSymbol(data.symbol)
    setMessage(`Partida criada. Compartilhe o código ${data.matchId}.`)
    await syncState(data.matchId)
  })

  const joinMatch = async (value = matchId) => runAction(async () => {
    const typedValue = String(value || '').trim()
    if (!typedValue) {
      throw new Error('Informe o código da partida.')
    }

    const data = await rpc('/rpc/join', 'POST', { matchId: typedValue })
    if (!data.success) throw new Error(data.message || 'Nao foi possivel entrar na partida.')

    setMatchId(data.matchId)
    setPlayerId(data.playerId)
    setSymbol(data.symbol)
    setMessage('Conexao estabelecida. Sistema sincronizado.')
    await syncState(data.matchId)
  })

  const makeMove = async (row, col) => runAction(async () => {
    if (!matchId || !playerId) {
      throw new Error('Crie ou entre em uma partida antes de jogar.')
    }

    const data = await rpc('/rpc/move', 'POST', {
      matchId,
      playerId,
      row,
      col
    })

    setMessage(data.message || 'Comando enviado.')
    if (data.state) {
      setBoard(data.state.board || defaultBoard())
      setTurn(data.state.currentTurn || '-')
      setStatus(data.state.status || 'UNKNOWN')
      setLastUpdated(new Date().toLocaleTimeString())
      if (data.state.winner) {
        setMessage(`Vencedor: ${data.state.winner}`)
      }
      if (data.state.status === 'DRAW') {
        setMessage('Resultado: velha.')
      }
    }
  })

  const copyMatchId = async () => {
    if (!matchId) return
    try {
      await navigator.clipboard.writeText(matchId)
      setMessage('Código da partida copiado para a área de transferência.')
    } catch (error) {
      setMessage('Nao foi possivel copiar automaticamente.')
    }
  }

  const clearSession = () => {
    setMatchId('')
    setPlayerId('')
    setSymbol('')
    setBoard(defaultBoard())
    setTurn('-')
    setStatus('WAITING')
    setMessage('Sessao limpa. Pronto para nova partida.')
    setLastUpdated('---')
    localStorage.removeItem(STORAGE_KEYS.matchId)
    localStorage.removeItem(STORAGE_KEYS.playerId)
    localStorage.removeItem(STORAGE_KEYS.symbol)
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="grid-overlay" />

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">NEURAL MATCH CONTROL</p>
          <h1>Jogo da Velha Multiplayer</h1>
          <p className="hero-text">
            Interface reimaginada em React com estética futurista, glassmorphism e fluxo rápido para criar,
            entrar e jogar partidas em tempo real.
          </p>

          <div className="hero-actions">
            <button className="primary-button" onClick={createMatch} disabled={busy}>
              {busy ? 'Processando...' : 'Criar partida'}
            </button>
            <button className="ghost-button" onClick={() => joinMatch(matchId)} disabled={busy}>
              Entrar na partida
            </button>
          </div>
        </div>

        <div className="signal-stack">
          <div className="signal-card signal-card-highlight">
            <span className="signal-label">BACKEND GATEWAY</span>
            <strong>{apiBase}</strong>
            <span className="signal-note">Deteccao automatica do ambiente local ou Railway.</span>
          </div>

          <div className="signal-row">
            <div className="signal-card mini">
              <span className="signal-label">STATUS</span>
              <strong>{status}</strong>
            </div>
            <div className="signal-card mini">
              <span className="signal-label">TURN</span>
              <strong>{turn}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard">
        <div className="panel terminal-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">SESSION NODE</p>
              <h2>Controle da partida</h2>
            </div>
            <span className={`pulse pulse-${String(status).toLowerCase()}`}>{status}</span>
          </div>

          <div className="session-grid">
            {statItems.map((item) => (
              <article key={item.key} className="session-stat">
                <span>{item.label}</span>
                <strong>
                  {item.key === 'match'
                    ? matchId || '—'
                    : item.key === 'player'
                      ? playerId || '—'
                      : item.key === 'symbol'
                        ? symbol || '—'
                        : turn || '—'}
                </strong>
              </article>
            ))}
          </div>

          <div className="input-shell">
            <label htmlFor="matchIdInput">Código da partida</label>
            <div className="input-row">
              <input
                id="matchIdInput"
                value={matchId}
                onChange={(event) => setMatchId(event.target.value)}
                placeholder="Cole ou digite o matchId"
                spellCheck="false"
              />
              <button className="small-button" onClick={() => joinMatch(matchId)} disabled={busy}>
                Entrar
              </button>
            </div>
          </div>

          <div className="session-actions">
            <button className="secondary-button" onClick={copyMatchId} disabled={!matchId || busy}>
              Copiar código
            </button>
            <button className="secondary-button" onClick={clearSession} disabled={busy}>
              Limpar sessão
            </button>
          </div>

          <div className="message-box">
            <span>Mensagem do sistema</span>
            <p>{message}</p>
          </div>

          <div className="meta-row">
            <span>Ultima sincronização</span>
            <strong>{lastUpdated}</strong>
          </div>
        </div>

        <div className="panel board-panel">
          <div className="panel-header compact">
            <div>
              <p className="panel-kicker">TACTICAL GRID</p>
              <h2>Tabuleiro holográfico</h2>
            </div>
            <span className="accent-badge">LIVE</span>
          </div>

          <Board board={board} onMove={makeMove} />

          <div className="board-footer">
            <div>
              <span>Player atual</span>
              <strong>{playerId || '—'}</strong>
            </div>
            <div>
              <span>Seu símbolo</span>
              <strong className="symbol-display">{symbol || '—'}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
