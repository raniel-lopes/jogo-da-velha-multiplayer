param(
    [string]$HostName = "127.0.0.1",
    [int]$Port = 1099,
    [string]$ServiceName = "TicTacToeService"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$jarPath = Join-Path $projectRoot "target/jogo-da-velha-rmi-1.0.0.jar"

if (-not (Test-Path $jarPath)) {
    Write-Host "JAR nao encontrado. Rodando build primeiro..."
    .\build.ps1
}

java -cp $jarPath com.jdv.client.ConsoleClient $HostName $Port $ServiceName
