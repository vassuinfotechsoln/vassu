@echo off
echo Setting up ngrok for Twilio webhooks...
echo.
echo 1. Install ngrok if you haven't already:
echo    Download from: https://ngrok.com/download
echo.
echo 2. Run this command in a separate terminal:
echo    ngrok http 3003
echo.
echo 3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
echo.
echo 4. Update your .env file:
echo    BASE_URL=https://your-ngrok-url.ngrok.io
echo.
echo 5. Restart your backend server
echo.
pause