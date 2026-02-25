@echo off
echo Starting VassuTalks with ngrok tunnel...
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ngrok is not installed or not in PATH
    echo Please download and install ngrok from: https://ngrok.com/download
    echo Then add it to your system PATH
    pause
    exit /b 1
)

echo Starting ngrok tunnel on port 3003...
start "ngrok" cmd /k "ngrok http 3003"

echo.
echo IMPORTANT: 
echo 1. Wait for ngrok to start and show the tunnel URL
echo 2. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
echo 3. Update your .env file: BASE_URL=https://your-ngrok-url.ngrok.io
echo 4. Press any key to start the backend server
echo.
pause

echo Starting backend server...
cd backend
npm run dev