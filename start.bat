@echo off
chcp 65001 >nul 2>&1
title AgriConnect - Platforma Agricola
color 0A

echo ============================================
echo    AgriConnect - Platforma Agricola
echo    Pornire Automata
echo ============================================
echo.

REM ─── Check Node.js ───
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [EROARE] Node.js nu este instalat!
    echo Descarca Node.js de la: https://nodejs.org/
    echo Instaleaza versiunea LTS, apoi ruleaza din nou acest script.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js %NODE_VER% detectat

REM ─── Get LAN IP Address via Node (picks 192.168.x.x or 10.x.x.x over other ranges) ───
for /f "tokens=*" %%i in ('node -e "const n=require('os').networkInterfaces();let best='localhost';for(const k in n)for(const a of n[k])if(a.family==='IPv4'&&!a.internal){if(a.address.startsWith('192.168.')||a.address.startsWith('10.')){console.log(a.address);process.exit()}best=a.address}console.log(best)"') do set IP=%%i
echo [OK] Adresa IP: %IP%
echo.

REM ─── Backend Setup ───
echo --------------------------------------------
echo [1/4] Verificare dependente Backend...
echo --------------------------------------------
cd /d "%~dp0agritech-backend"

if not exist "node_modules\@nestjs" (
    echo      Instalare dependente backend...
    echo      Aceasta poate dura cateva minute la prima utilizare...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% neq 0 (
        echo [EROARE] Instalare dependente backend esuata!
        pause
        exit /b 1
    )
    echo [OK] Dependente backend instalate!
) else (
    echo [OK] Dependente backend deja instalate.
)

REM ─── Frontend Setup ───
echo.
echo --------------------------------------------
echo [2/4] Verificare dependente Frontend...
echo --------------------------------------------
cd /d "%~dp0agritech-frontend"

if not exist "node_modules\react" (
    echo      Instalare dependente frontend...
    echo      Aceasta poate dura cateva minute la prima utilizare...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% neq 0 (
        echo [EROARE] Instalare dependente frontend esuata!
        pause
        exit /b 1
    )
    echo [OK] Dependente frontend instalate!
) else (
    echo [OK] Dependente frontend deja instalate.
)

REM ─── Start Backend ───
echo.
echo --------------------------------------------
echo [3/4] Pornire Backend (NestJS) pe port 3000...
echo --------------------------------------------
cd /d "%~dp0agritech-backend"
start "AgriConnect Backend" cmd /k "title AgriConnect Backend && color 0E && npm run start:dev"
echo      Se asteapta pornirea backend-ului (15 sec)...
ping -n 16 127.0.0.1 >nul

REM ─── Start Frontend ───
echo.
echo --------------------------------------------
echo [4/4] Pornire Frontend (Vite React) pe port 5173...
echo --------------------------------------------
cd /d "%~dp0agritech-frontend"
start "AgriConnect Frontend" cmd /k "title AgriConnect Frontend && color 0B && npm run dev -- --host 0.0.0.0"
ping -n 6 127.0.0.1 >nul

REM ─── Open Browser ───
start http://localhost:5173

REM ─── Done ───
echo.
echo ============================================
echo    AgriConnect pornit cu succes!
echo ============================================
echo.
echo    Frontend (local):  http://localhost:5173
echo    Frontend (retea):  http://%IP%:5173
echo    Backend API:       http://%IP%:3000/api/v1
echo.
echo    De pe alt PC din retea, deschide:
echo    http://%IP%:5173
echo.
echo    Pentru a opri: inchide ferestrele
echo    "AgriConnect Backend" si "AgriConnect Frontend"
echo    sau ruleaza stop.bat
echo ============================================
echo.
pause
