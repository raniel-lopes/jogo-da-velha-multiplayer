package com.jdv.service;

import java.util.UUID;

final class Match {
    final String matchId = UUID.randomUUID().toString();
    final String playerXId = UUID.randomUUID().toString();
    String playerOId;
    char[][] board = {
            {' ', ' ', ' '},
            {' ', ' ', ' '},
            {' ', ' ', ' '}
    };
    char turn = 'X';
    String status = "WAITING";
    String winner;

    boolean hasPlayer(String playerId) {
        return playerXId.equals(playerId) || (playerOId != null && playerOId.equals(playerId));
    }
}
