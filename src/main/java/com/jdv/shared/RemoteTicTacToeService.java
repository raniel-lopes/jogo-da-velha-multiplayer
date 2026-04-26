package com.jdv.shared;

import com.jdv.shared.dto.CreateMatchResponse;
import com.jdv.shared.dto.JoinMatchResponse;
import com.jdv.shared.dto.MatchState;
import com.jdv.shared.dto.MoveResponse;

import java.rmi.Remote;
import java.rmi.RemoteException;

public interface RemoteTicTacToeService extends Remote {
    CreateMatchResponse createMatch() throws RemoteException;

    JoinMatchResponse joinMatch(String matchId) throws RemoteException;

    MoveResponse makeMove(String matchId, String playerId, int row, int col) throws RemoteException;

    MatchState getMatchState(String matchId) throws RemoteException;
}
