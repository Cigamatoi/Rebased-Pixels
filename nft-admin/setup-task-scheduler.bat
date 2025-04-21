@echo off
echo Einrichten der automatisierten NFT-Minting-Aufgabe im Windows Task Scheduler...
echo.

REM Aktuelles Verzeichnis ermitteln
set "CURRENT_DIR=%~dp0"
set "SCRIPT_PATH=%CURRENT_DIR%start-auto-mint.bat"

REM XML-Datei für die Aufgabe erstellen
echo ^<?xml version="1.0" encoding="UTF-16"?^> > task.xml
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^> >> task.xml
echo   ^<RegistrationInfo^> >> task.xml
echo     ^<Description^>Führt stündlich den automatisierten NFT-Minting-Prozess für Rebased Pixels aus^</Description^> >> task.xml
echo   ^</RegistrationInfo^> >> task.xml
echo   ^<Triggers^> >> task.xml
echo     ^<TimeTrigger^> >> task.xml
echo       ^<Repetition^> >> task.xml
echo         ^<Interval^>PT1H^</Interval^> >> task.xml
echo         ^<StopAtDurationEnd^>false^</StopAtDurationEnd^> >> task.xml
echo       ^</Repetition^> >> task.xml
echo       ^<StartBoundary^>%DATE:~-4%-%DATE:~3,2%-%DATE:~0,2%T%TIME:~0,2%:%TIME:~3,2%:00^</StartBoundary^> >> task.xml
echo       ^<Enabled^>true^</Enabled^> >> task.xml
echo     ^</TimeTrigger^> >> task.xml
echo   ^</Triggers^> >> task.xml
echo   ^<Principals^> >> task.xml
echo     ^<Principal id="Author"^> >> task.xml
echo       ^<LogonType^>InteractiveToken^</LogonType^> >> task.xml
echo       ^<RunLevel^>HighestAvailable^</RunLevel^> >> task.xml
echo     ^</Principal^> >> task.xml
echo   ^</Principals^> >> task.xml
echo   ^<Settings^> >> task.xml
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^> >> task.xml
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^> >> task.xml
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^> >> task.xml
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^> >> task.xml
echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^> >> task.xml
echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^> >> task.xml
echo     ^<IdleSettings^> >> task.xml
echo       ^<StopOnIdleEnd^>false^</StopOnIdleEnd^> >> task.xml
echo       ^<RestartOnIdle^>false^</RestartOnIdle^> >> task.xml
echo     ^</IdleSettings^> >> task.xml
echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^> >> task.xml
echo     ^<Enabled^>true^</Enabled^> >> task.xml
echo     ^<Hidden^>false^</Hidden^> >> task.xml
echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^> >> task.xml
echo     ^<WakeToRun^>false^</WakeToRun^> >> task.xml
echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^> >> task.xml
echo     ^<Priority^>7^</Priority^> >> task.xml
echo   ^</Settings^> >> task.xml
echo   ^<Actions Context="Author"^> >> task.xml
echo     ^<Exec^> >> task.xml
echo       ^<Command^>%SCRIPT_PATH%^</Command^> >> task.xml
echo       ^<WorkingDirectory^>%CURRENT_DIR%^</WorkingDirectory^> >> task.xml
echo     ^</Exec^> >> task.xml
echo   ^</Actions^> >> task.xml
echo ^</Task^> >> task.xml

REM Aufgabe im Task Scheduler erstellen
schtasks /Create /TN "Rebased Pixels NFT Minting" /XML task.xml

REM XML-Datei löschen
del task.xml

echo.
echo Die Aufgabe wurde im Windows Task Scheduler eingerichtet.
echo Die Automatisierung wird stündlich ausgeführt.
echo.
pause 