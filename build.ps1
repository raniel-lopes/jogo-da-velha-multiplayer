param(
    [switch]$SkipClean
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

if ($SkipClean) {
    mvn package
} else {
    mvn clean package
}
