# YouTube Shorts Ad Scraper

A Python-based automation tool that uses Appium to scrape ads from YouTube Shorts on an Android Emulator.

## 🔎 Project Overview

This project automates the process of detecting and capturing ads that appear while scrolling through YouTube Shorts in the official YouTube Android app. It uses Appium to interact with an Android Emulator, simulating natural user behavior to reliably capture ad content.

## 📋 Key Features

- Automated interaction with the YouTube Android app
- Natural scrolling behavior through YouTube Shorts
- Intelligent ad detection algorithms
- Screenshot capture of identified ads
- Detailed logging for debugging and analysis
- Configurable parameters for customized scraping sessions

## 📌 Requirements

- Python 3.8+
- Appium Server
- Android Studio with Emulator (Pixel device, API 32+)
- Java Development Kit (JDK)
- Android SDK
- Node.js and npm

## 🗂️ Project Structure

```
youtube-shorts-scraper/
├── ads/                      # Folder for captured ad screenshots
├── scripts/
│   ├── scraper.py            # Main Appium automation script
│   ├── ad_detector.py        # Logic for identifying ads
│   ├── utils.py              # Helper functions
│   └── config.py             # Configuration settings
├── requirements.txt          # Python dependencies
├── logs/                     # Automation logs/debug info
└── README.md                 # Project documentation
```

## ⚙️ Setup Instructions

### 1. Environment Setup

#### Install Required Software:

- **Java Development Kit (JDK)**
  - Download and install JDK 8 or higher
  - Set JAVA_HOME environment variable

- **Android Studio & SDK**
  - Download and install Android Studio
  - Install Android SDK through Android Studio
  - Set ANDROID_HOME environment variable

- **Node.js & npm**
  - Download and install Node.js (includes npm)

- **Appium**
  - Install Appium using npm: `npm install -g appium`
  - Install Appium Doctor: `npm install -g appium-doctor`
  - Run `appium-doctor` to verify your setup

#### Python Environment:

```bash
# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Android Emulator Setup

1. Open Android Studio
2. Go to "Virtual Device Manager"
3. Create a new device (recommended: Pixel 6, API 32+)
4. Configure with at least 2GB RAM and 2GB internal storage
5. Start the emulator and verify it works

### 3. Install YouTube App

1. With the emulator running, open Google Play Store
2. Sign in with a Google account
3. Search for and install the official YouTube app
4. Open the app and sign in (recommended for consistent experience)

### 4. Appium Server Setup

1. Start Appium server:
```bash
appium
```

2. Verify the server is running at the default address (typically http://localhost:4723)

## 🚀 Usage

1. Ensure your Android Emulator is running
2. Make sure the YouTube app is installed
3. Start the Appium server
4. Run the scraper script:

```bash
python scripts/scraper.py
```

## ⚠️ Important Notes

- **App Interaction**: The script simulates natural user behavior to avoid detection
- **Ad Detection**: Ads are identified through a combination of UI element analysis and image recognition
- **Rate Limiting**: The script includes built-in delays to prevent being flagged as automated
- **Emulator Performance**: For best results, allocate sufficient resources to your emulator

## 📝 Configuration

Edit `scripts/config.py` to customize:

- Scrolling speed and patterns
- Session duration
- Screenshot quality and format
- Log verbosity
- Ad detection sensitivity

## 🔧 Troubleshooting

Common issues and solutions:

- **Element Not Found**: Adjust the wait times or element identification strategy
- **Emulator Performance**: Increase allocated RAM and CPU cores
- **App Updates**: YouTube app updates may change UI elements; update selectors accordingly
- **Connection Issues**: Verify Appium server is running and accessible

## 📊 Future Improvements

- Implement machine learning for better ad detection
- Add support for multiple emulator instances
- Create a dashboard for visualizing collected ad data
- Extend functionality to other social media platforms

## 📜 License

This project is for educational purposes only. Use responsibly and in accordance with YouTube's terms of service. 