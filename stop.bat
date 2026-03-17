@echo off
title AgriConnect - Oprire
echo Oprire AgriConnect...
echo.

:: Kill backend (port 3000)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Oprire Backend (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill frontend (port 5173)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Oprire Frontend (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

:: Also check 5174
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do (
    echo Oprire Frontend (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] AgriConnect oprit cu succes!
pause
