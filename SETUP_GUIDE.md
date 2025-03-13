# YouTube Shorts Ad Scraper - Setup Guide

This guide provides detailed step-by-step instructions for setting up the YouTube Shorts Ad Scraper project. Follow these instructions carefully to ensure a successful setup.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Python 3.8 or higher
- Java Development Kit (JDK) 8 or higher
- Android Studio
- Node.js and npm

## Step 1: Install Required Software

### Java Development Kit (JDK)

1. Download JDK from [Oracle's website](https://www.oracle.com/java/technologies/javase-downloads.html) or use OpenJDK
2. Install JDK following the installation instructions for your operating system
3. Set the JAVA_HOME environment variable:

   **On Windows:**
   ```
   setx JAVA_HOME "C:\Program Files\Java\jdk-xx.x.x"
   ```

   **On macOS/Linux:**
   ```
   export JAVA_HOME=/path/to/jdk
   echo 'export JAVA_HOME=/path/to/jdk' >> ~/.bash_profile
   ```

4. Verify installation:
   ```
   java -version
   ```

### Android Studio & SDK

1. Download Android Studio from [developer.android.com](https://developer.android.com/studio)
2. Install Android Studio following the installation instructions
3. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
4. Set the ANDROID_HOME environment variable:

   **On Windows:**
   ```
   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
   ```

   **On macOS:**
   ```
   export ANDROID_HOME=$HOME/Library/Android/sdk
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.bash_profile
   ```

   **On Linux:**
   ```
   export ANDROID_HOME=$HOME/Android/Sdk
   echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
   ```

5. Add platform-tools to your PATH:

   **On Windows:**
   ```
   setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
   ```

   **On macOS/Linux:**
   ```
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bash_profile
   ```

6. Verify installation:
   ```
   adb --version
   ```

### Node.js & npm

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install Node.js following the installation instructions
3. Verify installation:
   ```
   node --version
   npm --version
   ```

### Appium

1. Install Appium using npm:
   ```
   npm install -g appium
   ```

2. Install Appium Doctor to verify your setup:
   ```
   npm install -g appium-doctor
   ```

3. Verify installation:
   ```
   appium --version
   ```

4. Run Appium Doctor to check your setup:
   ```
   appium-doctor
   ```
   Fix any issues reported by Appium Doctor before proceeding.

## Step 2: Set Up Android Emulator

1. Open Android Studio
2. Click on "More Actions" or "Configure" and select "AVD Manager" (Android Virtual Device Manager)
3. Click "Create Virtual Device"
4. Select a device (recommended: Pixel 6)
5. Select a system image (recommended: API 32 or higher)
   - If you don't have the system image downloaded, click "Download" next to the system image
6. Configure the AVD with the following settings:
   - RAM: 2GB or more
   - Internal Storage: 2GB or more
   - SD Card: 512MB or more
7. Click "Finish" to create the emulator
8. Start the emulator by clicking the play button in the AVD Manager
9. Wait for the emulator to fully boot up

## Step 3: Install YouTube App on Emulator

1. With the emulator running, it should have the Google Play Store pre-installed
2. Open the Play Store app
3. Sign in with your Google account
4. Search for "YouTube"
5. Install the official YouTube app
6. Open the YouTube app and sign in (recommended for consistent experience)

## Step 4: Set Up the Project

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/youtube-shorts-ad-scraper.git
   cd youtube-shorts-ad-scraper
   ```

2. Create and activate a virtual environment (optional but recommended):
   
   **On Windows:**
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

   **On macOS/Linux:**
   ```
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Update configuration:
   - Open `scripts/config.py`
   - Update `DEVICE_NAME` to match your emulator name
   - Update `PLATFORM_VERSION` to match your Android version

## Step 5: Start Appium Server

1. Open a new terminal window
2. Start the Appium server:
   ```
   appium
   ```
3. Keep this terminal window open while running the scraper

## Step 6: Run the Scraper

1. Make sure the Android Emulator is running
2. Make sure the Appium server is running
3. In a new terminal window, navigate to the project directory
4. Activate the virtual environment if you created one
5. Run the scraper:
   ```
   python scripts/scraper.py
   ```

6. Optional command-line arguments:
   ```
   python scripts/scraper.py --duration 60 --max-shorts 200 --save-all --visual-detection
   ```

   - `--duration`: Duration of the scraping session in minutes (default: 30)
   - `--max-shorts`: Maximum number of shorts to scroll through (default: 100)
   - `--save-all`: Save screenshots of all shorts, not just ads
   - `--visual-detection`: Use visual detection for ads (more resource-intensive)

## Troubleshooting

### Common Issues

1. **Appium Connection Error**
   - Make sure Appium server is running
   - Check if the Appium server URL in `config.py` matches the actual server URL

2. **Emulator Not Detected**
   - Make sure the emulator is running
   - Check if the device name in `config.py` matches your emulator name
   - Run `adb devices` to verify the emulator is detected

3. **YouTube App Not Found**
   - Make sure the YouTube app is installed on the emulator
   - Check if the app package and activity in `config.py` are correct

4. **Element Not Found Errors**
   - The YouTube app UI may have changed
   - Update the XPath or element identifiers in the code

5. **Performance Issues**
   - Allocate more resources to the emulator
   - Disable visual detection if enabled
   - Reduce the session duration or max shorts

### Getting Help

If you encounter issues not covered in this guide:

1. Check the log files in the `logs` directory for error messages
2. Search for similar issues in the project's issue tracker
3. Create a new issue with detailed information about the problem

## Next Steps

After successfully setting up the scraper, you can:

1. Customize the ad detection logic in `scripts/ad_detector.py`
2. Modify the user simulation behavior in `scripts/scraper.py`
3. Analyze the collected ad data
4. Contribute improvements to the project

Happy scraping! 