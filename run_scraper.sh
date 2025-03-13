#!/bin/bash

# YouTube Shorts Ad Scraper Runner Script
# This script helps run the YouTube Shorts Ad Scraper with proper setup

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print a step
print_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check for Python
if ! command_exists python3; then
    print_error "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check for virtual environment
if [ ! -d "venv" ]; then
    print_step "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created."
fi

# Activate virtual environment
print_step "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Unix-like
    source venv/bin/activate
fi
print_success "Virtual environment activated."

# Install dependencies if needed
if [ ! -f "venv/.dependencies_installed" ]; then
    print_step "Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.dependencies_installed
    print_success "Dependencies installed."
fi

# Check if Appium is running
print_step "Checking if Appium server is running..."
if ! command_exists curl; then
    print_error "curl is not installed. Cannot check if Appium server is running."
    print_step "Please make sure Appium server is running at http://localhost:4723"
else
    if curl -s http://localhost:4723/status > /dev/null; then
        print_success "Appium server is running."
    else
        print_error "Appium server is not running."
        print_step "Please start Appium server in another terminal with: appium"
        read -p "Press Enter to continue once Appium is running, or Ctrl+C to exit..."
    fi
fi

# Check if Android emulator is running
print_step "Checking if Android emulator is running..."
if ! command_exists adb; then
    print_error "adb is not installed. Cannot check if Android emulator is running."
    print_step "Please make sure Android emulator is running."
else
    if adb devices | grep -q "emulator"; then
        print_success "Android emulator is running."
    else
        print_error "Android emulator is not running."
        print_step "Please start Android emulator from Android Studio."
        read -p "Press Enter to continue once emulator is running, or Ctrl+C to exit..."
    fi
fi

# Parse command line arguments
DURATION=30
MAX_SHORTS=100
SAVE_ALL=false
VISUAL_DETECTION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --duration)
            DURATION="$2"
            shift 2
            ;;
        --max-shorts)
            MAX_SHORTS="$2"
            shift 2
            ;;
        --save-all)
            SAVE_ALL=true
            shift
            ;;
        --visual-detection)
            VISUAL_DETECTION=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Build command
CMD="python scripts/scraper.py --duration $DURATION --max-shorts $MAX_SHORTS"
if [ "$SAVE_ALL" = true ]; then
    CMD="$CMD --save-all"
fi
if [ "$VISUAL_DETECTION" = true ]; then
    CMD="$CMD --visual-detection"
fi

# Run the scraper
print_step "Running YouTube Shorts Ad Scraper..."
print_step "Duration: $DURATION minutes, Max shorts: $MAX_SHORTS"
if [ "$SAVE_ALL" = true ]; then
    print_step "Saving screenshots of all shorts"
fi
if [ "$VISUAL_DETECTION" = true ]; then
    print_step "Using visual detection for ads"
fi
echo ""
eval $CMD

# Deactivate virtual environment
deactivate
print_success "Scraper finished." 