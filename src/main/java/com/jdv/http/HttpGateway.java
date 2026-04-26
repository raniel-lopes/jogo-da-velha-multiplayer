package com.jdv.http;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.jdv.shared.RemoteTicTacToeService;
import spark.Spark;

import static spark.Spark.get;
import static spark.Spark.options;
import static spark.Spark.post;

public final class HttpGateway {

    private HttpGateway() {
    }

    public static void start(RemoteTicTacToeService remoteService, int port) {
        Gson gson = new Gson();

        Spark.port(port);

        Spark.before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
        });

        Spark.exception(Exception.class, (exception, request, response) -> {
            response.status(500);
            response.type("application/json");
            JsonObject payload = new JsonObject();
            payload.addProperty("success", false);
            payload.addProperty("message", "Erro interno no backend: " + exception.getMessage());
            response.body(gson.toJson(payload));
            exception.printStackTrace();
        });

        options("/*", (request, response) -> "OK");

        get("/", (req, res) -> {
            res.type("text/html");
            return """
                    <!doctype html>
                    <html lang=\"pt-BR\">
                    <head><meta charset=\"UTF-8\"><title>Jogo da Velha API</title></head>
                    <body style=\"font-family: Arial, sans-serif; padding: 24px;\">
                        <h2>Backend online</h2>
                        <p>API do Jogo da Velha para o frontend no Vercel.</p>
                        <ul>
                            <li><a href=\"/health\">GET /health</a></li>
                            <li>POST /rpc/create</li>
                            <li>POST /rpc/join</li>
                            <li>POST /rpc/move</li>
                            <li>GET /rpc/state/:matchId</li>
                        </ul>
                    </body>
                    </html>
                    """;
        });

        get("/health", (req, res) -> {
            res.type("application/json");
            JsonObject payload = new JsonObject();
            payload.addProperty("status", "ok");
            payload.addProperty("service", "tic-tac-toe-http-rmi");
            return gson.toJson(payload);
        });

        post("/rpc/create", (req, res) -> {
            res.type("application/json");
            return gson.toJson(remoteService.createMatch());
        });

        post("/rpc/join", (req, res) -> {
            res.type("application/json");
            JsonObject payload = gson.fromJson(req.body(), JsonObject.class);
            String matchId = payload == null || !payload.has("matchId") ? null : payload.get("matchId").getAsString();
            return gson.toJson(remoteService.joinMatch(matchId));
        });

        post("/rpc/move", (req, res) -> {
            res.type("application/json");
            JsonObject payload = gson.fromJson(req.body(), JsonObject.class);
            String matchId = payload.get("matchId").getAsString();
            String playerId = payload.get("playerId").getAsString();
            int row = payload.get("row").getAsInt();
            int col = payload.get("col").getAsInt();
            return gson.toJson(remoteService.makeMove(matchId, playerId, row, col));
        });

        get("/rpc/state/:matchId", (req, res) -> {
            res.type("application/json");
            return gson.toJson(remoteService.getMatchState(req.params(":matchId")));
        });
    }
}
