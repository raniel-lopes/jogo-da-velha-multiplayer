package com.jdv.shared.dto;

import java.io.Serial;
import java.io.Serializable;

public class CreateMatchResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    public final boolean success;
    public final String message;
    public final String matchId;
    public final String playerId;
    public final String symbol;

    public CreateMatchResponse(boolean success, String message, String matchId, String playerId, String symbol) {
        this.success = success;
        this.message = message;
        this.matchId = matchId;
        this.playerId = playerId;
        this.symbol = symbol;
    }
}
