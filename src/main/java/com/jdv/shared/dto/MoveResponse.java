package com.jdv.shared.dto;

import java.io.Serial;
import java.io.Serializable;

public class MoveResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    public final boolean success;
    public final String message;
    public final MatchState state;

    public MoveResponse(boolean success, String message, MatchState state) {
        this.success = success;
        this.message = message;
        this.state = state;
    }
}
