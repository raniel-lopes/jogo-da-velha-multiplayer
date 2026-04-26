package com.jdv.shared.dto;

import java.io.Serial;
import java.io.Serializable;

public class MatchState implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    public final boolean success;
    public final String message;
    public final String matchId;
    public final String[][] board;
    public final String currentTurn;
    public final String status;
    public final String winner;

    public MatchState(
            boolean success,
            String message,
            String matchId,
            String[][] board,
            String currentTurn,
            String status,
            String winner
    ) {
        this.success = success;
        this.message = message;
        this.matchId = matchId;
        this.board = board;
        this.currentTurn = currentTurn;
        this.status = status;
        this.winner = winner;
    }
}
