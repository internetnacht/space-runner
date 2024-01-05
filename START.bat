@echo off
setlocal enabledelayedexpansion

set "customProcessName=start_inacht24_space_runner_server"

REM Check if another instance is already running
wmic process where "CommandLine like '%%customProcessName%%.bat%'" get ProcessId 2>nul | findstr /r /v "^$"
if %errorlevel% equ 0 (
    echo Another instance of %customProcessName% is already running. Closing it.

    REM Terminate existing instances
    wmic process where "CommandLine like '%%customProcessName%%.bat%'" call terminate
    timeout /t 5 >nul
)

REM Start the server batch file with the custom process name
echo Starting %customProcessName%...
start "" "cmd.exe /c %customProcessName%.bat"

endlocal