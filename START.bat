@echo off
setlocal enabledelayedexpansion

set "customProcessName=start_inacht24_space_runner_server.bat"

REM Check if another instance is already running
tasklist /fi "windowtitle eq %customProcessName%" 2>nul | find /i "%customProcessName%" >nul
if %errorlevel% equ 0 (
    echo Another instance of %customProcessName% is already running. Closing it.

    REM Terminate existing instances
    taskkill /f /fi "windowtitle eq %customProcessName%"
    timeout /t 5 >nul
)

REM Start the server program with the custom process name
echo Starting %customProcessName%...
start "" "%customProcessName%"