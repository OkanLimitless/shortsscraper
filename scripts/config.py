"""
Configuration settings for the YouTube Shorts Ad Scraper.
This file contains all configurable parameters used by the scraper.
"""

import os
from datetime import datetime

# Project paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADS_DIR = os.path.join(PROJECT_ROOT, 'ads')
LOGS_DIR = os.path.join(PROJECT_ROOT, 'logs')

# Create directories if they don't exist
os.makedirs(ADS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Log file path
LOG_FILE = os.path.join(LOGS_DIR, f'scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')

# Appium settings
APPIUM_SERVER_URL = 'http://localhost:4723'

# Android Emulator capabilities
DEVICE_NAME = 'Pixel_6_API_32'  # Change this to match your emulator name
PLATFORM_VERSION = '12'  # Change this to match your Android version
APP_PACKAGE = 'com.google.android.youtube'
APP_ACTIVITY = 'com.google.android.youtube.HomeActivity'

# Automation settings
IMPLICIT_WAIT_TIME = 10  # seconds
EXPLICIT_WAIT_TIME = 15  # seconds
SCROLL_DURATION = 0.5  # seconds
SCROLL_PAUSE_TIME = 2.0  # seconds between scrolls
SESSION_DURATION = 60 * 30  # 30 minutes in seconds
MAX_SHORTS_TO_SCROLL = 100  # Maximum number of shorts to scroll through

# Ad detection settings
SCREENSHOT_QUALITY = 90  # JPEG quality (0-100)
AD_DETECTION_CONFIDENCE = 0.7  # Minimum confidence for ad detection (0-1)
SAVE_ALL_SCREENSHOTS = False  # Whether to save screenshots of all shorts (not just ads)

# UI Element identifiers
# Note: These may need to be updated if the YouTube app is updated
SHORTS_TAB_ACCESSIBILITY_ID = 'Shorts'
AD_INDICATORS = [
    'Ad',
    'Sponsored',
    'Shop now',
    'Learn more',
    'Install now',
    'Download'
]

# User simulation settings
MIN_WATCH_TIME = 2  # Minimum time to watch a short (seconds)
MAX_WATCH_TIME = 8  # Maximum time to watch a short (seconds)
RANDOM_INTERACTIONS = True  # Whether to perform random interactions (likes, etc.)
INTERACTION_PROBABILITY = 0.1  # Probability of performing a random interaction (0-1) 