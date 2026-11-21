@echo off
cd /d "%~dp0"
set "NODE="
where node >nul 2>nul && set "NODE=node"
if not defined NODE for /d %%D in ("%APPDATA%\Accio\pre-install\*") do if exist "%%D\node\node.exe" set "NODE=%%D\node\node.exe"
if not defined NODE goto nonode

echo ============================================
echo  Zorlang site - rebuild all pages
echo ============================================
echo.
"%NODE%" build.mjs
if errorlevel 1 goto buildfail
echo.
echo [OK] All pages rebuilt.
netstat -ano | findstr /C:"127.0.0.1:8803" | findstr /C:"LISTENING" >nul
if not errorlevel 1 goto open
set "PY="
for /d %%D in ("%APPDATA%\Accio\pre-install\*") do if exist "%%D\python\python.exe" set "PY=%%D\python\python.exe"
if defined PY start "zorlang-preview" /min "%PY%" -m http.server 8803 --bind 127.0.0.1 --directory dist
timeout /t 2 >nul

:open
start "" "http://127.0.0.1:8803/"
echo Browser opened. If the page still shows old text, press Ctrl+F5.
goto end

:buildfail
echo [ERROR] Build failed. Read the message above.
echo Most often a missing comma or a curly quote inside a JSON file in content\.
goto end

:nonode
echo [ERROR] node.exe not found.
echo Tell your assistant: rebuild launcher cannot find node.

:end
pause
