package com.jdv.client;

import com.jdv.shared.RemoteTicTacToeService;
import com.jdv.shared.dto.CreateMatchResponse;
import com.jdv.shared.dto.JoinMatchResponse;
import com.jdv.shared.dto.MatchState;
import com.jdv.shared.dto.MoveResponse;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.Scanner;

public class ConsoleClient {

    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);

        String host = args.length > 0 ? args[0] : "127.0.0.1";
        int port = args.length > 1 ? Integer.parseInt(args[1]) : 1099;
        String serviceName = args.length > 2 ? args[2] : "TicTacToeService";

        Registry registry = LocateRegistry.getRegistry(host, port);
        RemoteTicTacToeService service = (RemoteTicTacToeService) registry.lookup(serviceName);

        System.out.println("Conectado ao servidor RMI.");
        System.out.println("1) Criar partida");
        System.out.println("2) Entrar em partida");
        System.out.print("Escolha: ");
        String option = scanner.nextLine().trim();

        String matchId;
        String playerId;
        String symbol;

        if ("1".equals(option)) {
            CreateMatchResponse created = service.createMatch();
            if (!created.success) {
                System.out.println("Falha ao criar partida: " + created.message);
                return;
            }
            matchId = created.matchId;
            playerId = created.playerId;
            symbol = created.symbol;
            System.out.println("Partida criada com sucesso.");
            System.out.println("Match ID: " + matchId);
            System.out.println("Seu simbolo: " + symbol);
            System.out.println("Compartilhe o Match ID com o segundo jogador.");
        } else {
            System.out.print("Digite o Match ID: ");
            String typedMatchId = scanner.nextLine().trim();
            JoinMatchResponse joined = service.joinMatch(typedMatchId);
            if (!joined.success) {
                System.out.println("Falha ao entrar na partida: " + joined.message);
                return;
            }
            matchId = joined.matchId;
            playerId = joined.playerId;
            symbol = joined.symbol;
            System.out.println("Entrada confirmada.");
            System.out.println("Seu simbolo: " + symbol);
        }

        while (true) {
            MatchState state = service.getMatchState(matchId);
            printBoard(state.board);
            System.out.println("Status: " + state.status + " | Turno: " + state.currentTurn);

            if ("FINISHED".equals(state.status)) {
                System.out.println("Vencedor: " + state.winner);
                break;
            }
            if ("DRAW".equals(state.status)) {
                System.out.println("Deu velha.");
                break;
            }
            if (!"IN_PROGRESS".equals(state.status)) {
                System.out.println("Aguardando segundo jogador...");
                Thread.sleep(2000);
                continue;
            }

            if (state.currentTurn.equals(symbol)) {
                System.out.print("Sua jogada (linha coluna, ex: 1 1): ");
                String[] parts = scanner.nextLine().trim().split("\\s+");
                if (parts.length != 2) {
                    System.out.println("Entrada invalida.");
                    continue;
                }
                int row;
                int col;
                try {
                    row = Integer.parseInt(parts[0]);
                    col = Integer.parseInt(parts[1]);
                } catch (NumberFormatException e) {
                    System.out.println("Digite dois numeros entre 0 e 2.");
                    continue;
                }
                MoveResponse move = service.makeMove(matchId, playerId, row, col);
                System.out.println(move.message);
            } else {
                System.out.println("Aguardando jogada do adversario...");
                Thread.sleep(2000);
            }
        }
    }

    private static void printBoard(String[][] board) {
        System.out.println();
        for (int i = 0; i < 3; i++) {
            System.out.printf(" %s | %s | %s %n",
                    cell(board[i][0]),
                    cell(board[i][1]),
                    cell(board[i][2]));
            if (i < 2) {
                System.out.println("---+---+---");
            }
        }
        System.out.println();
    }

    private static String cell(String value) {
        return value == null || value.isBlank() ? " " : value;
    }
}
