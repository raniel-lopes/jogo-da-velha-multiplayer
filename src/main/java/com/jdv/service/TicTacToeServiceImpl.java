package com.jdv.service;

import com.jdv.shared.RemoteTicTacToeService;
import com.jdv.shared.dto.CreateMatchResponse;
import com.jdv.shared.dto.JoinMatchResponse;
import com.jdv.shared.dto.MatchState;
import com.jdv.shared.dto.MoveResponse;

import java.rmi.RemoteException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class TicTacToeServiceImpl implements RemoteTicTacToeService {

    private final Map<String, Match> matches = new ConcurrentHashMap<>();

    public TicTacToeServiceImpl() {
    }

    @Override
    public synchronized CreateMatchResponse createMatch() {
        Match match = new Match();
        matches.put(match.matchId, match);
        return new CreateMatchResponse(
                true,
                "Partida criada com sucesso.",
                match.matchId,
                match.playerXId,
                "X"
        );
    }

    @Override
    public synchronized JoinMatchResponse joinMatch(String matchId) {
        Match match = matches.get(matchId);
        if (match == null) {
            return new JoinMatchResponse(false, "Partida nao encontrada.", null, null, null);
        }
        if (match.playerOId != null) {
            return new JoinMatchResponse(false, "Partida ja esta cheia.", matchId, null, null);
        }

        match.playerOId = UUID.randomUUID().toString();
        match.status = "IN_PROGRESS";
        return new JoinMatchResponse(true, "Voce entrou na partida.", matchId, match.playerOId, "O");
    }

    @Override
    public synchronized MoveResponse makeMove(String matchId, String playerId, int row, int col) {
        Match match = matches.get(matchId);
        if (match == null) {
            return new MoveResponse(false, "Partida nao encontrada.", null);
        }
        if (!match.hasPlayer(playerId)) {
            return new MoveResponse(false, "Jogador invalido para essa partida.", toState(match));
        }
        if (!"IN_PROGRESS".equals(match.status)) {
            return new MoveResponse(false, "Partida nao esta em andamento.", toState(match));
        }
        if (row < 0 || row > 2 || col < 0 || col > 2) {
            return new MoveResponse(false, "Posicao invalida.", toState(match));
        }

        char expectedSymbol = match.playerXId.equals(playerId) ? 'X' : 'O';
        if (expectedSymbol != match.turn) {
            return new MoveResponse(false, "Nao eh o turno desse jogador.", toState(match));
        }
        if (match.board[row][col] != ' ') {
            return new MoveResponse(false, "Essa casa ja esta ocupada.", toState(match));
        }

        match.board[row][col] = expectedSymbol;

        if (hasWinner(match.board, expectedSymbol)) {
            match.status = "FINISHED";
            match.winner = String.valueOf(expectedSymbol);
            return new MoveResponse(true, "Jogada realizada. Temos um vencedor!", toState(match));
        }

        if (isBoardFull(match.board)) {
            match.status = "DRAW";
            match.winner = null;
            return new MoveResponse(true, "Jogada realizada. Deu velha.", toState(match));
        }

        match.turn = expectedSymbol == 'X' ? 'O' : 'X';
        return new MoveResponse(true, "Jogada realizada com sucesso.", toState(match));
    }

    @Override
    public synchronized MatchState getMatchState(String matchId) {
        Match match = matches.get(matchId);
        if (match == null) {
            return new MatchState(false, "Partida nao encontrada.", null, null, null, null, null);
        }
        return toState(match);
    }

    private boolean hasWinner(char[][] board, char symbol) {
        for (int i = 0; i < 3; i++) {
            if (board[i][0] == symbol && board[i][1] == symbol && board[i][2] == symbol) {
                return true;
            }
            if (board[0][i] == symbol && board[1][i] == symbol && board[2][i] == symbol) {
                return true;
            }
        }
        return (board[0][0] == symbol && board[1][1] == symbol && board[2][2] == symbol)
                || (board[0][2] == symbol && board[1][1] == symbol && board[2][0] == symbol);
    }

    private boolean isBoardFull(char[][] board) {
        for (char[] row : board) {
            for (char cell : row) {
                if (cell == ' ') {
                    return false;
                }
            }
        }
        return true;
    }

    private MatchState toState(Match match) {
        String[][] board = new String[3][3];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                board[i][j] = match.board[i][j] == ' ' ? "" : String.valueOf(match.board[i][j]);
            }
        }
        return new MatchState(
                true,
                "OK",
                match.matchId,
                board,
                String.valueOf(match.turn),
                match.status,
                match.winner
        );
    }
}
