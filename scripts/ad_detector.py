"""
Ad detection module for YouTube Shorts Ad Scraper.
This module contains functions for detecting ads in YouTube Shorts.
"""

import os
import re
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from loguru import logger

import config
from utils import extract_text_from_screen, contains_ad_indicator

class AdDetector:
    """
    Class for detecting ads in YouTube Shorts.
    Uses multiple detection methods including text analysis and visual cues.
    """
    
    def __init__(self):
        """Initialize the AdDetector with default settings."""
        logger.info("Initializing AdDetector")
        
        # Load any pre-trained models or templates if needed
        # self.model = load_model()  # Placeholder for future ML implementation
        
        # Initialize counters for statistics
        self.total_shorts_analyzed = 0
        self.total_ads_detected = 0
        self.detection_methods_stats = {
            'text_indicators': 0,
            'visual_cues': 0,
            'ui_elements': 0
        }
    
    def detect_ad(self, driver):
        """
        Main method to detect if the current Short is an ad.
        
        Args:
            driver: Appium WebDriver instance
            
        Returns:
            tuple: (is_ad, ad_info) - Whether it's an ad and additional info
        """
        self.total_shorts_analyzed += 1
        logger.debug(f"Analyzing Short #{self.total_shorts_analyzed}")
        
        # Combine multiple detection methods
        is_ad = False
        ad_info = {}
        
        # Method 1: Text-based detection
        is_ad_text, ad_text = self._detect_by_text(driver)
        if is_ad_text:
            is_ad = True
            ad_info['detection_method'] = 'text_indicators'
            ad_info['ad_text'] = ad_text
            self.detection_methods_stats['text_indicators'] += 1
        
        # Method 2: UI element detection (if not already detected)
        if not is_ad:
            is_ad_ui, ui_info = self._detect_by_ui_elements(driver)
            if is_ad_ui:
                is_ad = True
                ad_info['detection_method'] = 'ui_elements'
                ad_info['ui_info'] = ui_info
                self.detection_methods_stats['ui_elements'] += 1
        
        # Method 3: Visual cue detection (if not already detected)
        # This is more resource-intensive, so only use if needed
        if not is_ad and config.USE_VISUAL_DETECTION:
            is_ad_visual, visual_info = self._detect_by_visual_cues(driver)
            if is_ad_visual:
                is_ad = True
                ad_info['detection_method'] = 'visual_cues'
                ad_info['visual_info'] = visual_info
                self.detection_methods_stats['visual_cues'] += 1
        
        # Update statistics
        if is_ad:
            self.total_ads_detected += 1
            logger.info(f"Ad detected! (#{self.total_ads_detected}) Method: {ad_info.get('detection_method')}")
        
        return is_ad, ad_info
    
    def _detect_by_text(self, driver):
        """
        Detect ads by analyzing text on the screen.
        
        Args:
            driver: Appium WebDriver instance
            
        Returns:
            tuple: (is_ad, ad_text) - Whether it's an ad and the matching text
        """
        logger.debug("Detecting ads by text analysis")
        
        # Extract all text from the screen
        text_elements = extract_text_from_screen(driver)
        
        # Check if any text contains ad indicators
        return contains_ad_indicator(text_elements)
    
    def _detect_by_ui_elements(self, driver):
        """
        Detect ads by looking for specific UI elements.
        
        Args:
            driver: Appium WebDriver instance
            
        Returns:
            tuple: (is_ad, ui_info) - Whether it's an ad and UI element info
        """
        logger.debug("Detecting ads by UI elements")
        
        ui_info = {}
        
        try:
            # Look for common ad UI elements
            # These XPaths are examples and may need to be adjusted
            ad_button_xpath = "//android.widget.Button[contains(@text, 'Shop') or contains(@text, 'Install') or contains(@text, 'Download')]"
            ad_label_xpath = "//android.widget.TextView[contains(@text, 'Ad') or contains(@text, 'Sponsored')]"
            
            # Check for ad buttons
            try:
                ad_buttons = driver.find_elements_by_xpath(ad_button_xpath)
                if ad_buttons:
                    ui_info['ad_button'] = ad_buttons[0].text
                    return True, ui_info
            except Exception as e:
                logger.debug(f"Error checking ad buttons: {str(e)}")
            
            # Check for ad labels
            try:
                ad_labels = driver.find_elements_by_xpath(ad_label_xpath)
                if ad_labels:
                    ui_info['ad_label'] = ad_labels[0].text
                    return True, ui_info
            except Exception as e:
                logger.debug(f"Error checking ad labels: {str(e)}")
            
            return False, ui_info
            
        except Exception as e:
            logger.error(f"Error in UI element detection: {str(e)}")
            return False, ui_info
    
    def _detect_by_visual_cues(self, driver):
        """
        Detect ads by analyzing visual elements in the screenshot.
        This is a more advanced method that could use image processing or ML.
        
        Args:
            driver: Appium WebDriver instance
            
        Returns:
            tuple: (is_ad, visual_info) - Whether it's an ad and visual info
        """
        logger.debug("Detecting ads by visual cues")
        
        visual_info = {}
        
        try:
            # Take a screenshot
            screenshot = driver.get_screenshot_as_png()
            image = Image.open(BytesIO(screenshot))
            
            # Convert to OpenCV format
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Example: Look for specific colors or patterns associated with ads
            # This is a simplified example and would need to be enhanced
            # for real-world use
            
            # Convert to HSV for better color detection
            hsv = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2HSV)
            
            # Define range for yellow color (often used in ad buttons)
            lower_yellow = np.array([20, 100, 100])
            upper_yellow = np.array([30, 255, 255])
            
            # Create a mask
            mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
            
            # Count yellow pixels
            yellow_pixel_count = cv2.countNonZero(mask)
            yellow_ratio = yellow_pixel_count / (opencv_image.shape[0] * opencv_image.shape[1])
            
            visual_info['yellow_ratio'] = yellow_ratio
            
            # If yellow occupies more than a threshold, it might be an ad
            # This threshold would need tuning
            if yellow_ratio > 0.05:
                return True, visual_info
            
            # More sophisticated visual detection could be added here
            
            return False, visual_info
            
        except Exception as e:
            logger.error(f"Error in visual cue detection: {str(e)}")
            return False, visual_info
    
    def get_statistics(self):
        """
        Get statistics about the ad detection.
        
        Returns:
            dict: Statistics about the ad detection
        """
        if self.total_shorts_analyzed == 0:
            ad_percentage = 0
        else:
            ad_percentage = (self.total_ads_detected / self.total_shorts_analyzed) * 100
            
        return {
            'total_shorts_analyzed': self.total_shorts_analyzed,
            'total_ads_detected': self.total_ads_detected,
            'ad_percentage': ad_percentage,
            'detection_methods': self.detection_methods_stats
        }

# Add this to config.py if not already there
if not hasattr(config, 'USE_VISUAL_DETECTION'):
    config.USE_VISUAL_DETECTION = False  # Visual detection is resource-intensive 