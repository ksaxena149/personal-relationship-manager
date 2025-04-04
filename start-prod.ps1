Write-Host "Copying static assets to standalone directory..." -ForegroundColor Green

# Create directories if they don't exist
New-Item -ItemType Directory -Path .next\standalone\.next\static -Force | Out-Null

# Copy static assets
Write-Host "Copying CSS and static assets..." -ForegroundColor Yellow
Copy-Item -Path .next\static\* -Destination .next\standalone\.next\static\ -Recurse -Force

# Start the server
Write-Host "Starting the production server..." -ForegroundColor Green
node .next\standalone\server.js 