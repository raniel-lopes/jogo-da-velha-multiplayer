import React, { useEffect, useState } from 'react'
import Board from './components/Board'

const detectApiBase = () => {
  try {
    const host = location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8080'
  } catch (e) {}
  return 'https://jogo-da-velha-multiplayer-production.up.railway.app'
}

export default function App() {
  const [apiBase] = useState(detectApiBase())
  const [matchId, setMatchId] = useState(localStorage.getItem('matchId') || '')
  const [playerId, setPlayerId] = useState(localStorage.getItem('playerId') || '')
  const [symbol, setSymbol] = useState(localStorage.getItem('symbol') || '')
  const [board, setBoard] = useState([['','',''],['','',''],['','','']])
  const [turn, setTurn] = useState('-')
  const [status, setStatus] = useState('-')
  const [message, setMessage] = useState('Aguardando ação...')

  useEffect(()=>{
    localStorage.setItem('matchId', matchId)
    localStorage.setItem('playerId', playerId)
    localStorage.setItem('symbol', symbol)
  }, [matchId, playerId, symbol])

  const rpc = async (path, method='GET', body) => {
    const res = await fetch(`${apiBase}${path}`, {
      method,
      headers: {'Content-Type':'application/json'},
      body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) throw new Error('Falha HTTP ' + res.status)
    return res.json()
  }

  const createMatch = async () => {
    try {
      const data = await rpc('/rpc/create', 'POST')
      if (!data.success) { setMessage(data.message); return }
      setMatchId(data.matchId); setPlayerId(data.playerId); setSymbol(data.symbol)
      setMessage('Partida criada. ID: ' + data.matchId)
      await refreshState(data.matchId)
    } catch (e) { setMessage(e.message) }
  }

  const joinMatch = async (id) => {
    try {
      const data = await rpc('/rpc/join', 'POST', { matchId: id })
      if (!data.success) { setMessage(data.message); return }
      setMatchId(data.matchId); setPlayerId(data.playerId); setSymbol(data.symbol)
      setMessage('Entrou na partida')
      await refreshState(data.matchId)
    } catch (e) { setMessage(e.message) }
  }

  const refreshState = async (id = matchId) => {
    try {
      if (!id) { setMessage('Crie ou entre em uma partida'); return }
      const data = await rpc(`/rpc/state/${id}`)
      if (!data.success) { setMessage(data.message); return }
      setBoard(data.board || [['','',''],['','',''],['','','']])
      setTurn(data.currentTurn || '-')
      setStatus(data.status || '-')
      setMessage(data.winner ? `Vencedor: ${data.winner}` : 'OK')
    } catch (e) { setMessage(e.message) }
  }

  const makeMove = async (row, col) => {
    try {
      if (!matchId || !playerId) { setMessage('Crie/entre em uma partida'); return }
      const data = await rpc('/rpc/move', 'POST', { matchId, playerId, row, col })
      setMessage(data.message || 'Jogada enviada')
      if (data.state && data.state.board) {
        setBoard(data.state.board); setTurn(data.state.currentTurn); setStatus(data.state.status)
      }
    } catch (e) { setMessage(e.message) }
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Jogo da Velha Multiplayer</h1>
        <p className="subtitle">Frontend em React, backend no Railway ({apiBase})</p>

        <div className="actions">
          <button onClick={createMatch}>Criar partida</button>
          <button onClick={()=>joinMatch(prompt('Cole o ID da partida'))}>Entrar na partida</button>
        </div>

        <div className="field-group">
          <label>ID da partida</label>
          <input value={matchId} onChange={e=>setMatchId(e.target.value)} placeholder="ID da partida" />
        </div>

        <div className="status">
          <p><strong>Match:</strong> <span>{matchId || '-'}</span></p>
          <p><strong>Player ID:</strong> <span>{playerId || '-'}</span></p>
          <p><strong>Seu símbolo:</strong> <span>{symbol || '-'}</span></p>
          <p><strong>Turno atual:</strong> <span>{turn}</span></p>
          <p><strong>Status:</strong> <span>{status}</span></p>
          <p><strong>Mensagem:</strong> <span>{message}</span></p>
        </div>

        <Board board={board} onMove={makeMove} />

        <div className="actions">
          <button onClick={()=>refreshState()}>Atualizar estado</button>
        </div>
      </section>
    </main>
  )
}
