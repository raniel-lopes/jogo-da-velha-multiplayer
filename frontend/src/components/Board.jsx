import React from 'react'

export default function Board({ board, onMove }) {
  return (
    <div id="board" className="board" role="grid" aria-label="Tabuleiro do jogo da velha">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const symbol = cell || ''
          const isFilled = Boolean(symbol)
          const classes = [
            'cell',
            isFilled ? 'filled' : 'empty',
            symbol === 'X' ? 'symbol-x' : '',
            symbol === 'O' ? 'symbol-o' : ''
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              className={classes}
              onClick={() => onMove(rowIndex, colIndex)}
              aria-label={`Linha ${rowIndex + 1}, coluna ${colIndex + 1}${symbol ? `, ocupada por ${symbol}` : ', vazia'}`}
            >
              <span>{symbol}</span>
            </button>
          )
        })
      )}
    </div>
  )
}
