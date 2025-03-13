"""
Main script for YouTube Shorts Ad Scraper.
This script automates the YouTube app using Appium to detect and capture ads in Shorts.
"""

import os
import sys
import time
import random
import signal
import argparse
from datetime import datetime, timedelta
import json

from appium import webdriver
from appium.webdriver.common.mobileby import MobileBy
from appium.webdriver.common.touch_action import TouchAction
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    WebDriverException
)
from loguru import logger

# Import local modules
import config
from utils import setup_logging, save_screenshot, random_sleep, perform_scroll
from ad_detector import AdDetector

class YouTubeShortsAdScraper:
    """
    Main class for scraping ads from YouTube Shorts.
    """
    
    def __init__(self, args=None):
        """
        Initialize the scraper with configuration settings.
        
        Args:
            args: Command line arguments
        """
        # Set up logging
        self.logger = setup_logging()
        self.logger.info("Initializing YouTube Shorts Ad Scraper")
        
        # Parse command line arguments
        self.args = self._parse_args(args)
        
        # Initialize Appium driver
        self.driver = None
        
        # Initialize ad detector
        self.ad_detector = AdDetector()
        
        # Initialize statistics
        self.start_time = None
        self.end_time = None
        self.shorts_scrolled = 0
        self.ads_captured = 0
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _parse_args(self, args):
        """
        Parse command line arguments.
        
        Args:
            args: Command line arguments
            
        Returns:
            Parsed arguments
        """
        parser = argparse.ArgumentParser(description='YouTube Shorts Ad Scraper')
        
        parser.add_argument(
            '--duration',
            type=int,
            default=config.SESSION_DURATION // 60,
            help='Duration of the scraping session in minutes'
        )
        
        parser.add_argument(
            '--max-shorts',
            type=int,
            default=config.MAX_SHORTS_TO_SCROLL,
            help='Maximum number of shorts to scroll through'
        )
        
        parser.add_argument(
            '--save-all',
            action='store_true',
            default=config.SAVE_ALL_SCREENSHOTS,
            help='Save screenshots of all shorts, not just ads'
        )
        
        parser.add_argument(
            '--visual-detection',
            action='store_true',
            default=config.USE_VISUAL_DETECTION,
            help='Use visual detection for ads (more resource-intensive)'
        )
        
        parsed_args = parser.parse_args(args)
        
        # Update config with parsed arguments
        config.SESSION_DURATION = parsed_args.duration * 60
        config.MAX_SHORTS_TO_SCROLL = parsed_args.max_shorts
        config.SAVE_ALL_SCREENSHOTS = parsed_args.save_all
        config.USE_VISUAL_DETECTION = parsed_args.visual_detection
        
        return parsed_args
    
    def _setup_driver(self):
        """
        Set up the Appium WebDriver with desired capabilities.
        
        Returns:
            bool: Whether the setup was successful
        """
        try:
            self.logger.info("Setting up Appium WebDriver")
            
            # Define desired capabilities
            desired_caps = {
                'platformName': 'Android',
                'deviceName': config.DEVICE_NAME,
                'platformVersion': config.PLATFORM_VERSION,
                'appPackage': config.APP_PACKAGE,
                'appActivity': config.APP_ACTIVITY,
                'autoGrantPermissions': True,
                'noReset': True,  # Don't reset app state between sessions
                'newCommandTimeout': 600,  # 10 minutes
                'adbExecTimeout': 60000  # 60 seconds
            }
            
            # Connect to Appium server
            self.logger.info(f"Connecting to Appium server at {config.APPIUM_SERVER_URL}")
            self.driver = webdriver.Remote(config.APPIUM_SERVER_URL, desired_caps)
            
            # Set implicit wait time
            self.driver.implicitly_wait(config.IMPLICIT_WAIT_TIME)
            
            self.logger.info("Appium WebDriver setup successful")
            return True
            
        except Exception as e:
            self.logger.error(f"Error setting up Appium WebDriver: {str(e)}")
            return False
    
    def _navigate_to_shorts(self):
        """
        Navigate to the Shorts section in the YouTube app.
        
        Returns:
            bool: Whether navigation was successful
        """
        try:
            self.logger.info("Navigating to YouTube Shorts")
            
            # Wait for app to load
            self.logger.debug("Waiting for app to load")
            random_sleep(3, 5)
            
            # Find and click on Shorts tab
            self.logger.debug("Looking for Shorts tab")
            
            # Try different methods to find the Shorts tab
            try:
                # Try by accessibility ID first
                shorts_tab = self.driver.find_element_by_accessibility_id(config.SHORTS_TAB_ACCESSIBILITY_ID)
                self.logger.debug("Found Shorts tab by accessibility ID")
            except NoSuchElementException:
                try:
                    # Try by XPath as fallback
                    shorts_xpath = "//android.widget.TextView[@text='Shorts']"
                    shorts_tab = self.driver.find_element_by_xpath(shorts_xpath)
                    self.logger.debug("Found Shorts tab by XPath")
                except NoSuchElementException:
                    # Try by resource ID as another fallback
                    # Note: Resource IDs may change with app updates
                    shorts_id = "com.google.android.youtube:id/shorts_tab"
                    shorts_tab = self.driver.find_element_by_id(shorts_id)
                    self.logger.debug("Found Shorts tab by resource ID")
            
            # Click on Shorts tab
            shorts_tab.click()
            self.logger.info("Clicked on Shorts tab")
            
            # Wait for Shorts to load
            random_sleep(3, 5)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error navigating to Shorts: {str(e)}")
            return False
    
    def _scroll_shorts(self):
        """
        Scroll through Shorts and detect ads.
        """
        self.logger.info("Starting to scroll through Shorts")
        
        # Calculate end time
        self.start_time = datetime.now()
        end_time = self.start_time + timedelta(seconds=config.SESSION_DURATION)
        
        # Main scrolling loop
        while (
            datetime.now() < end_time and 
            self.shorts_scrolled < config.MAX_SHORTS_TO_SCROLL
        ):
            try:
                # Increment counter
                self.shorts_scrolled += 1
                self.logger.info(f"Scrolling Short #{self.shorts_scrolled}")
                
                # Wait for Short to load
                random_sleep(1, 2)
                
                # Check if current Short is an ad
                is_ad, ad_info = self.ad_detector.detect_ad(self.driver)
                
                # Save screenshot if it's an ad or if save_all is enabled
                if is_ad:
                    self.ads_captured += 1
                    ad_text = ad_info.get('ad_text', None)
                    save_screenshot(self.driver, is_ad=True, ad_text=ad_text)
                    
                    # Log ad details
                    self.logger.info(f"Ad #{self.ads_captured} detected in Short #{self.shorts_scrolled}")
                    self.logger.info(f"Ad info: {ad_info}")
                    
                    # Watch the ad for a bit longer to simulate interest
                    random_sleep(config.MIN_WATCH_TIME * 1.5, config.MAX_WATCH_TIME * 1.5)
                else:
                    # Save screenshot if save_all is enabled
                    if config.SAVE_ALL_SCREENSHOTS:
                        save_screenshot(self.driver, is_ad=False)
                    
                    # Watch the Short for a random amount of time
                    random_sleep(config.MIN_WATCH_TIME, config.MAX_WATCH_TIME)
                
                # Perform random interactions if enabled
                if config.RANDOM_INTERACTIONS and random.random() < config.INTERACTION_PROBABILITY:
                    self._perform_random_interaction()
                
                # Scroll to next Short
                perform_scroll(self.driver)
                
            except Exception as e:
                self.logger.error(f"Error during scrolling: {str(e)}")
                # Continue to next Short
                try:
                    perform_scroll(self.driver)
                except:
                    self.logger.error("Failed to recover by scrolling")
                    random_sleep(3, 5)
        
        # Record end time
        self.end_time = datetime.now()
        self.logger.info("Finished scrolling through Shorts")
    
    def _perform_random_interaction(self):
        """
        Perform a random interaction with the current Short.
        This helps make the automation appear more human-like.
        """
        try:
            # Choose a random interaction
            interaction = random.choice(['like', 'comment', 'share', 'none'])
            
            if interaction == 'none':
                return
                
            self.logger.debug(f"Performing random interaction: {interaction}")
            
            if interaction == 'like':
                # Try to find and click the like button
                try:
                    # This XPath is an example and may need to be adjusted
                    like_button_xpath = "//android.widget.ImageView[@content-desc='Like']"
                    like_button = self.driver.find_element_by_xpath(like_button_xpath)
                    like_button.click()
                    self.logger.debug("Clicked like button")
                    random_sleep(0.5, 1.5)
                    # Click again to unlike (to avoid affecting recommendations too much)
                    like_button.click()
                except:
                    self.logger.debug("Could not find like button")
            
            elif interaction == 'comment':
                # Simulate clicking comment button but don't actually comment
                try:
                    comment_button_xpath = "//android.widget.ImageView[@content-desc='Comments']"
                    comment_button = self.driver.find_element_by_xpath(comment_button_xpath)
                    comment_button.click()
                    self.logger.debug("Clicked comment button")
                    random_sleep(1, 3)
                    # Press back to exit comments
                    self.driver.press_keycode(4)
                except:
                    self.logger.debug("Could not find comment button")
            
            elif interaction == 'share':
                # Simulate clicking share button but don't actually share
                try:
                    share_button_xpath = "//android.widget.ImageView[@content-desc='Share']"
                    share_button = self.driver.find_element_by_xpath(share_button_xpath)
                    share_button.click()
                    self.logger.debug("Clicked share button")
                    random_sleep(1, 2)
                    # Press back to exit share menu
                    self.driver.press_keycode(4)
                except:
                    self.logger.debug("Could not find share button")
        
        except Exception as e:
            self.logger.debug(f"Error during random interaction: {str(e)}")
    
    def _save_statistics(self):
        """
        Save statistics about the scraping session.
        """
        try:
            if not self.start_time or not self.end_time:
                self.logger.warning("Cannot save statistics: missing start or end time")
                return
                
            # Calculate duration
            duration = (self.end_time - self.start_time).total_seconds()
            
            # Get ad detector statistics
            ad_detector_stats = self.ad_detector.get_statistics()
            
            # Combine statistics
            stats = {
                'session_start': self.start_time.isoformat(),
                'session_end': self.end_time.isoformat(),
                'duration_seconds': duration,
                'shorts_scrolled': self.shorts_scrolled,
                'ads_captured': self.ads_captured,
                'ad_percentage': (self.ads_captured / self.shorts_scrolled * 100) if self.shorts_scrolled > 0 else 0,
                'ad_detector_stats': ad_detector_stats
            }
            
            # Save to file
            timestamp = self.start_time.strftime("%Y%m%d_%H%M%S")
            stats_file = os.path.join(config.LOGS_DIR, f"stats_{timestamp}.json")
            
            with open(stats_file, 'w') as f:
                json.dump(stats, f, indent=2)
                
            self.logger.info(f"Statistics saved to {stats_file}")
            
            # Log summary
            self.logger.info("=== Session Summary ===")
            self.logger.info(f"Duration: {duration:.1f} seconds")
            self.logger.info(f"Shorts scrolled: {self.shorts_scrolled}")
            self.logger.info(f"Ads captured: {self.ads_captured}")
            if self.shorts_scrolled > 0:
                self.logger.info(f"Ad percentage: {self.ads_captured / self.shorts_scrolled * 100:.1f}%")
            self.logger.info("=====================")
            
        except Exception as e:
            self.logger.error(f"Error saving statistics: {str(e)}")
    
    def _signal_handler(self, sig, frame):
        """
        Handle termination signals for graceful shutdown.
        
        Args:
            sig: Signal number
            frame: Current stack frame
        """
        self.logger.info(f"Received signal {sig}, shutting down gracefully")
        self.cleanup()
        sys.exit(0)
    
    def cleanup(self):
        """
        Clean up resources before exiting.
        """
        self.logger.info("Cleaning up resources")
        
        # Save statistics if we have data
        if self.shorts_scrolled > 0:
            if not self.end_time:
                self.end_time = datetime.now()
            self._save_statistics()
        
        # Quit the driver
        if self.driver:
            try:
                self.logger.info("Closing Appium WebDriver")
                self.driver.quit()
            except Exception as e:
                self.logger.error(f"Error closing Appium WebDriver: {str(e)}")
    
    def run(self):
        """
        Run the scraper.
        
        Returns:
            bool: Whether the scraping was successful
        """
        try:
            # Set up the driver
            if not self._setup_driver():
                return False
            
            # Navigate to Shorts
            if not self._navigate_to_shorts():
                return False
            
            # Scroll through Shorts
            self._scroll_shorts()
            
            # Clean up
            self.cleanup()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error running scraper: {str(e)}")
            self.cleanup()
            return False

if __name__ == "__main__":
    scraper = YouTubeShortsAdScraper()
    scraper.run() 