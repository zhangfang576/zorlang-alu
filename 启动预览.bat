@echo off
cd /d "%~dp0"
set "PORT=8803"
set "PY="
where python >nul 2>nul && set "PY=python"
if not defined PY for /d %%D in ("%APPDATA%\Accio\pre-install\*") do if exist "%%D\python\python.exe" set "PY=%%D\python\python.exe"
if not defined PY goto nopy
netstat -ano | findstr /C:"127.0.0.1:%PORT%" | findstr /C:"LISTENING" >nul
if not errorlevel 1 goto already

echo ============================================
echo  Zorlang site - local preview
echo  URL: http://127.0.0.1:%PORT%/
echo  Close this window to stop the preview.
echo ============================================
echo.
start "" "http://127.0.0.1:%PORT%/"
"%PY%" -m http.server %PORT% --bind 127.0.0.1 --directory dist
echo.
echo Preview stopped.
goto end

:already
echo Preview is already running: http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"
goto end

:nopy
echo [ERROR] python.exe not found.
echo Tell your assistant: preview launcher cannot find python.

:end
pause
