import React from 'react'

export default function Board({ board, onMove }) {
  return (
    <div id="board" className="board">
      {board.map((row, r) => row.map((cell, c) => {
        const symbol = cell || ''
        const cls = 'cell' + (symbol === 'X' ? ' symbol-x' : symbol === 'O' ? ' symbol-o' : '')
        return (
          <button key={`${r}-${c}`} className={cls} onClick={() => onMove(r, c)}>
            {symbol}
          </button>
        )
      }))}
    </div>
  )
}
