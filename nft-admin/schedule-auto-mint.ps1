# Rebased Pixels - Automatische Einrichtung einer geplanten Aufgabe für NFT Auto-Mint
# Dieses Skript muss mit administrativen Rechten ausgeführt werden

# Überprüfen, ob das Skript als Administrator ausgeführt wird
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Dieses Skript muss als Administrator ausgeführt werden." -ForegroundColor Red
    Write-Host "Bitte starten Sie PowerShell als Administrator und versuchen Sie es erneut." -ForegroundColor Red
    Write-Host "Drücken Sie eine beliebige Taste, um fortzufahren..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Konfiguration
$taskName = "RebasedPixels-AutoMint"
$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "start-auto-mint.bat"
$workingDirectory = $PSScriptRoot

# Anzeige der Startinformationen
Write-Host "===== Rebased Pixels Auto-Mint Scheduler =====" -ForegroundColor Cyan
Write-Host "Dieses Skript richtet eine geplante Aufgabe ein, die den Auto-Mint-Prozess regelmäßig ausführt."
Write-Host ""
Write-Host "Skriptpfad: $scriptPath" -ForegroundColor Yellow
Write-Host "Arbeitsverzeichnis: $workingDirectory" -ForegroundColor Yellow
Write-Host ""

# Prüfen, ob das Batch-Skript existiert
if (-not (Test-Path $scriptPath)) {
    Write-Host "FEHLER: Die Datei start-auto-mint.bat wurde nicht gefunden." -ForegroundColor Red
    Write-Host "Bitte stellen Sie sicher, dass Sie sich im richtigen Verzeichnis befinden." -ForegroundColor Red
    Write-Host "Drücken Sie eine beliebige Taste, um fortzufahren..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Bestehende Aufgabe entfernen, falls vorhanden
try {
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Eine bestehende Aufgabe mit dem Namen '$taskName' wurde gefunden. Diese wird entfernt..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "Bestehende Aufgabe wurde entfernt." -ForegroundColor Green
    }
} catch {
    Write-Host "Warnung: Konnte die bestehende Aufgabe nicht überprüfen oder entfernen." -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

# Abfrage der Zeitplaneinstellungen
Write-Host "Bitte geben Sie den gewünschten Zeitplan an:" -ForegroundColor Cyan
Write-Host "1: Stündlich" -ForegroundColor White
Write-Host "2: Täglich (empfohlen)" -ForegroundColor White
Write-Host "3: Wöchentlich" -ForegroundColor White
Write-Host "4: Benutzerdefiniert" -ForegroundColor White

$scheduleChoice = Read-Host "Ihre Wahl (1-4, Standard ist 2)"
if ([string]::IsNullOrEmpty($scheduleChoice)) { $scheduleChoice = "2" }

# Variable für die Aufgabeneinstellungen
$trigger = $null

switch ($scheduleChoice) {
    "1" {
        # Stündlich
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
        Write-Host "Aufgabe wird stündlich ausgeführt." -ForegroundColor Green
    }
    "2" {
        # Täglich
        $time = Read-Host "Zu welcher Uhrzeit soll die Aufgabe täglich ausgeführt werden? (Format: HH:MM, Standard ist 03:00)"
        if ([string]::IsNullOrEmpty($time)) { $time = "03:00" }
        
        try {
            $dateTime = [DateTime]::ParseExact($time, "HH:mm", $null)
            $trigger = New-ScheduledTaskTrigger -Daily -At $dateTime
            Write-Host "Aufgabe wird täglich um $time Uhr ausgeführt." -ForegroundColor Green
        } catch {
            Write-Host "Ungültiges Zeitformat. Verwende Standardzeit 03:00 Uhr." -ForegroundColor Yellow
            $trigger = New-ScheduledTaskTrigger -Daily -At "03:00"
        }
    }
    "3" {
        # Wöchentlich
        $time = Read-Host "Zu welcher Uhrzeit soll die Aufgabe ausgeführt werden? (Format: HH:MM, Standard ist 03:00)"
        if ([string]::IsNullOrEmpty($time)) { $time = "03:00" }
        
        $dayOfWeek = Read-Host "An welchem Wochentag? (Mo, Di, Mi, Do, Fr, Sa, So - Standard ist Mo)"
        $dayMap = @{
            "Mo" = "Monday"; "Di" = "Tuesday"; "Mi" = "Wednesday"; "Do" = "Thursday"; 
            "Fr" = "Friday"; "Sa" = "Saturday"; "So" = "Sunday"
        }
        
        if ([string]::IsNullOrEmpty($dayOfWeek) -or -not $dayMap.ContainsKey($dayOfWeek)) {
            $dayOfWeek = "Monday"
            Write-Host "Ungültiger Wochentag. Verwende Montag." -ForegroundColor Yellow
        } else {
            $dayOfWeek = $dayMap[$dayOfWeek]
        }
        
        try {
            $dateTime = [DateTime]::ParseExact($time, "HH:mm", $null)
            $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $dayOfWeek -At $dateTime
            Write-Host "Aufgabe wird wöchentlich am $dayOfWeek um $time Uhr ausgeführt." -ForegroundColor Green
        } catch {
            Write-Host "Ungültiges Zeitformat. Verwende Standardzeit 03:00 Uhr am Montag." -ForegroundColor Yellow
            $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "03:00"
        }
    }
    "4" {
        # Benutzerdefiniert - Hier muss der Benutzer die Task Scheduler-GUI verwenden
        Write-Host "Für einen benutzerdefinierten Zeitplan wird die Task Scheduler-GUI geöffnet." -ForegroundColor Yellow
        Write-Host "Die Aufgabe wird mit einem einfachen täglichen Zeitplan erstellt, den Sie anpassen können." -ForegroundColor Yellow
        $trigger = New-ScheduledTaskTrigger -Daily -At "03:00"
        $openGuiAfterCreation = $true
    }
    default {
        # Ungültige Eingabe - Standardwert verwenden
        Write-Host "Ungültige Auswahl. Verwende täglichen Zeitplan um 03:00 Uhr." -ForegroundColor Yellow
        $trigger = New-ScheduledTaskTrigger -Daily -At "03:00"
    }
}

# Aufgabeneinstellungen
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$scriptPath`"" -WorkingDirectory $workingDirectory
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Benutzerkontooptionen
Write-Host ""
Write-Host "Unter welchem Benutzerkonto soll die Aufgabe ausgeführt werden?" -ForegroundColor Cyan
Write-Host "1: SYSTEM (erfordert keine Anmeldung, aber möglicherweise eingeschränkter Zugriff)" -ForegroundColor White
Write-Host "2: Aktueller Benutzer (erfordert Anmeldung für die Ausführung)" -ForegroundColor White

$userChoice = Read-Host "Ihre Wahl (1-2, Standard ist 2)"
if ([string]::IsNullOrEmpty($userChoice)) { $userChoice = "2" }

$principal = $null

switch ($userChoice) {
    "1" {
        # SYSTEM-Konto
        $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        Write-Host "Aufgabe wird unter dem SYSTEM-Konto ausgeführt." -ForegroundColor Green
    }
    default {
        # Aktueller Benutzer
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Highest
        Write-Host "Aufgabe wird unter dem aktuellen Benutzerkonto ($currentUser) ausgeführt." -ForegroundColor Green
    }
}

# Aufgabe erstellen
try {
    Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Settings $settings -Principal $principal -Force
    Write-Host ""
    Write-Host "Die geplante Aufgabe '$taskName' wurde erfolgreich erstellt!" -ForegroundColor Green
    
    # Optionale Öffnung des Task Scheduler für benutzerdefinierte Einstellungen
    if ($openGuiAfterCreation) {
        Write-Host "Task Scheduler wird geöffnet, damit Sie die Einstellungen anpassen können..." -ForegroundColor Yellow
        Start-Process "taskschd.msc"
    }
} catch {
    Write-Host "FEHLER beim Erstellen der geplanten Aufgabe:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Die geplante Aufgabe wurde eingerichtet. Der Auto-Mint-Prozess wird automatisch nach dem festgelegten Zeitplan ausgeführt." -ForegroundColor Cyan
Write-Host "Sie können die Einstellungen jederzeit in der Windows Task Scheduler-Anwendung ändern." -ForegroundColor Cyan
Write-Host ""
Write-Host "Drücken Sie eine beliebige Taste, um fortzufahren..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 