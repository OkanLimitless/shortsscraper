@echo off
:: YouTube Shorts Ad Scraper Runner Script for Windows
:: This script helps run the YouTube Shorts Ad Scraper with proper setup

echo [STEP] Checking Python installation...
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python and try again.
    pause
    exit /b 1
)

:: Check for virtual environment
if not exist venv (
    echo [STEP] Creating virtual environment...
    python -m venv venv
    echo [SUCCESS] Virtual environment created.
)

:: Activate virtual environment
echo [STEP] Activating virtual environment...
call venv\Scripts\activate.bat

:: Install dependencies if needed
if not exist venv\.dependencies_installed (
    echo [STEP] Installing dependencies...
    pip install -r requirements.txt
    echo. > venv\.dependencies_installed
    echo [SUCCESS] Dependencies installed.
)

:: Check if Appium is running
echo [STEP] Checking if Appium server is running...
curl -s http://localhost:4723/status >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Appium server is not running.
    echo [STEP] Please start Appium server in another terminal with: appium
    echo Press Enter to continue once Appium is running, or Ctrl+C to exit...
    pause >nul
)

:: Check if Android emulator is running
echo [STEP] Checking if Android emulator is running...
adb devices | findstr "emulator" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Android emulator is not running.
    echo [STEP] Please start Android emulator from Android Studio.
    echo Press Enter to continue once emulator is running, or Ctrl+C to exit...
    pause >nul
)

:: Parse command line arguments
set DURATION=30
set MAX_SHORTS=100
set SAVE_ALL=false
set VISUAL_DETECTION=false

:parse_args
if "%~1"=="" goto end_parse_args
if "%~1"=="--duration" (
    set DURATION=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--max-shorts" (
    set MAX_SHORTS=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--save-all" (
    set SAVE_ALL=true
    shift
    goto parse_args
)
if "%~1"=="--visual-detection" (
    set VISUAL_DETECTION=true
    shift
    goto parse_args
)
echo [ERROR] Unknown option: %~1
exit /b 1

:end_parse_args

:: Build command
set CMD=python scripts/scraper.py --duration %DURATION% --max-shorts %MAX_SHORTS%
if "%SAVE_ALL%"=="true" (
    set CMD=%CMD% --save-all
)
if "%VISUAL_DETECTION%"=="true" (
    set CMD=%CMD% --visual-detection
)

:: Run the scraper
echo [STEP] Running YouTube Shorts Ad Scraper...
echo [STEP] Duration: %DURATION% minutes, Max shorts: %MAX_SHORTS%
if "%SAVE_ALL%"=="true" (
    echo [STEP] Saving screenshots of all shorts
)
if "%VISUAL_DETECTION%"=="true" (
    echo [STEP] Using visual detection for ads
)
echo.
%CMD%

:: Deactivate virtual environment
call venv\Scripts\deactivate.bat
echo [SUCCESS] Scraper finished.
pause 