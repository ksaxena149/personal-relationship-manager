param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet("start", "stop", "rebuild", "logs", "clean")]
    [string]$Command
)

$ErrorActionPreference = "Stop"

function Start-DockerCompose {
    Write-Host "Starting Docker containers..."
    docker-compose --env-file .env.docker up -d
}

function Stop-DockerCompose {
    Write-Host "Stopping Docker containers..."
    docker-compose down
}

function Rebuild-DockerCompose {
    Write-Host "Rebuilding Docker containers..."
    docker-compose --env-file .env.docker up -d --build
}

function Show-DockerLogs {
    Write-Host "Showing Docker logs..."
    docker-compose logs -f
}

function Clean-DockerEnvironment {
    Write-Host "Cleaning Docker environment..."
    docker-compose down -v
    docker system prune -f
}

switch ($Command) {
    "start" { Start-DockerCompose }
    "stop" { Stop-DockerCompose }
    "rebuild" { Rebuild-DockerCompose }
    "logs" { Show-DockerLogs }
    "clean" { Clean-DockerEnvironment }
} 