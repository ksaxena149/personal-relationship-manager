@echo off
echo Copying static assets to standalone directory...
echo.

mkdir -p .next\standalone\.next\static 2>nul
copy /Y .next\static\*.* .next\standalone\.next\static\ >nul

mkdir -p .next\standalone\public 2>nul
xcopy /E /Y /Q public\*.* .next\standalone\public\ >nul

echo Starting the production server...
echo.
node .next\standalone\server.js 