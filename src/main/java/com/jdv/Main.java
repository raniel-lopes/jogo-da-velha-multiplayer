package com.jdv;

import com.jdv.http.HttpGateway;
import com.jdv.service.TicTacToeServiceImpl;
import com.jdv.shared.RemoteTicTacToeService;

import java.rmi.Remote;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;

public class Main {

    // Keep strong refs to avoid RMI distributed GC removing exported object.
    private static TicTacToeServiceImpl serviceKeepAlive;
    private static Remote exportedKeepAlive;

    public static void main(String[] args) throws Exception {
        int httpPort = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        int rmiPort = Integer.parseInt(System.getenv().getOrDefault("RMI_PORT", "1099"));
        String serviceName = System.getenv().getOrDefault("RMI_SERVICE_NAME", "TicTacToeService");
        String rmiHost = System.getenv().getOrDefault("RMI_HOST", "127.0.0.1");

        // For cloud hosting, this affects the host serialized in RMI stubs.
        System.setProperty("java.rmi.server.hostname", rmiHost);

        Registry registry = LocateRegistry.createRegistry(rmiPort);
        serviceKeepAlive = new TicTacToeServiceImpl();
        exportedKeepAlive = UnicastRemoteObject.exportObject(serviceKeepAlive, 0);
        registry.rebind(serviceName, exportedKeepAlive);

        RemoteTicTacToeService rmiStub = (RemoteTicTacToeService) registry.lookup(serviceName);
        HttpGateway.start(rmiStub, httpPort);

        String rmiUrl = String.format("rmi://%s:%d/%s", rmiHost, rmiPort, serviceName);
        String httpUrl = String.format("http://0.0.0.0:%d", httpPort);

        System.out.printf("Servidor RMI ativo em %s%n", rmiUrl);
        System.out.printf("Gateway HTTP ativo em %s%n", httpUrl);
    }
}
