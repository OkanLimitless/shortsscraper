"""
Test script to verify that the Appium setup is working correctly.
This script attempts to connect to the Appium server and launch the YouTube app.
"""

import os
import sys
import time
from appium import webdriver
from loguru import logger

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

def setup_logging():
    """Set up basic logging for the test script."""
    logger.remove()
    logger.add(
        lambda msg: print(msg, end=""),
        level="INFO",
        format="{time:HH:mm:ss} | <level>{level: <8}</level> | {message}"
    )
    return logger

def test_appium_connection():
    """Test connection to Appium server and launch YouTube app."""
    logger = setup_logging()
    driver = None
    
    try:
        logger.info("Testing Appium connection...")
        
        # Define desired capabilities
        desired_caps = {
            'platformName': 'Android',
            'deviceName': config.DEVICE_NAME,
            'platformVersion': config.PLATFORM_VERSION,
            'appPackage': config.APP_PACKAGE,
            'appActivity': config.APP_ACTIVITY,
            'autoGrantPermissions': True,
            'noReset': True,
            'newCommandTimeout': 300
        }
        
        # Connect to Appium server
        logger.info(f"Connecting to Appium server at {config.APPIUM_SERVER_URL}")
        driver = webdriver.Remote(config.APPIUM_SERVER_URL, desired_caps)
        
        # Set implicit wait time
        driver.implicitly_wait(10)
        
        # Get device information
        logger.info("Connection successful!")
        logger.info(f"Device: {driver.capabilities.get('deviceName')}")
        logger.info(f"Platform: {driver.capabilities.get('platformName')} {driver.capabilities.get('platformVersion')}")
        logger.info(f"App: {driver.capabilities.get('appPackage')}")
        
        # Wait for app to load
        logger.info("Waiting for YouTube app to load...")
        time.sleep(5)
        
        # Get current activity
        current_activity = driver.current_activity
        logger.info(f"Current activity: {current_activity}")
        
        # Take a screenshot
        logger.info("Taking a screenshot...")
        screenshot_path = os.path.join(config.LOGS_DIR, "test_screenshot.png")
        driver.get_screenshot_as_file(screenshot_path)
        logger.info(f"Screenshot saved to {screenshot_path}")
        
        # Test passed
        logger.info("✅ Test passed! Appium setup is working correctly.")
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        return False
        
    finally:
        # Clean up
        if driver:
            logger.info("Closing Appium WebDriver...")
            driver.quit()

if __name__ == "__main__":
    test_appium_connection() 