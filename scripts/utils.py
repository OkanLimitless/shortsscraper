"""
Utility functions for the YouTube Shorts Ad Scraper.
This module contains helper functions used across the project.
"""

import os
import time
import random
import logging
from datetime import datetime
from PIL import Image
import numpy as np
import cv2
from loguru import logger
import config

def setup_logging():
    """
    Configure the logging system for the application.
    Sets up both file and console logging with appropriate formatting.
    """
    # Remove default logger
    logger.remove()
    
    # Add file logger
    logger.add(
        config.LOG_FILE,
        rotation="100 MB",
        retention="1 week",
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    )
    
    # Add console logger
    logger.add(
        lambda msg: print(msg, end=""),
        level="INFO",
        format="{time:HH:mm:ss} | <level>{level: <8}</level> | {message}"
    )
    
    logger.info(f"Logging initialized. Log file: {config.LOG_FILE}")
    return logger

def save_screenshot(driver, is_ad=False, ad_text=None):
    """
    Capture and save a screenshot from the driver.
    
    Args:
        driver: Appium WebDriver instance
        is_ad (bool): Whether the screenshot is of an ad
        ad_text (str, optional): Text found in the ad for filename
        
    Returns:
        str: Path to the saved screenshot
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    
    # Create filename based on whether it's an ad
    if is_ad:
        prefix = "ad"
        if ad_text:
            # Clean ad_text for filename (remove special chars)
            clean_text = "".join(c if c.isalnum() else "_" for c in ad_text)
            clean_text = clean_text[:50]  # Limit length
            filename = f"{prefix}_{clean_text}_{timestamp}.jpg"
        else:
            filename = f"{prefix}_{timestamp}.jpg"
    else:
        if not config.SAVE_ALL_SCREENSHOTS:
            return None
        filename = f"short_{timestamp}.jpg"
    
    file_path = os.path.join(config.ADS_DIR, filename)
    
    # Take screenshot and save
    screenshot = driver.get_screenshot_as_png()
    image = Image.open(BytesIO(screenshot))
    image.save(file_path, quality=config.SCREENSHOT_QUALITY)
    
    if is_ad:
        logger.info(f"Ad screenshot saved: {filename}")
    else:
        logger.debug(f"Short screenshot saved: {filename}")
        
    return file_path

def random_sleep(min_time=1.0, max_time=3.0):
    """
    Sleep for a random amount of time within the given range.
    Helps simulate human behavior and avoid detection.
    
    Args:
        min_time (float): Minimum sleep time in seconds
        max_time (float): Maximum sleep time in seconds
    """
    sleep_time = random.uniform(min_time, max_time)
    logger.debug(f"Sleeping for {sleep_time:.2f} seconds")
    time.sleep(sleep_time)

def perform_scroll(driver, start_x_percent=0.5, start_y_percent=0.7, end_x_percent=0.5, end_y_percent=0.3, duration=None):
    """
    Perform a scroll gesture on the screen.
    
    Args:
        driver: Appium WebDriver instance
        start_x_percent (float): Starting x-coordinate as percentage of screen width
        start_y_percent (float): Starting y-coordinate as percentage of screen height
        end_x_percent (float): Ending x-coordinate as percentage of screen width
        end_y_percent (float): Ending y-coordinate as percentage of screen height
        duration (float, optional): Duration of scroll in milliseconds
    """
    if duration is None:
        duration = config.SCROLL_DURATION
    
    # Get screen dimensions
    window_size = driver.get_window_size()
    width = window_size['width']
    height = window_size['height']
    
    # Calculate actual coordinates
    start_x = int(width * start_x_percent)
    start_y = int(height * start_y_percent)
    end_x = int(width * end_x_percent)
    end_y = int(height * end_y_percent)
    
    # Add slight randomness to make it more human-like
    start_x += random.randint(-10, 10)
    start_y += random.randint(-10, 10)
    end_x += random.randint(-10, 10)
    end_y += random.randint(-10, 10)
    
    # Perform the scroll
    logger.debug(f"Scrolling from ({start_x}, {start_y}) to ({end_x}, {end_y})")
    driver.swipe(start_x, start_y, end_x, end_y, int(duration * 1000))
    
    # Pause after scrolling
    random_sleep(config.SCROLL_PAUSE_TIME * 0.8, config.SCROLL_PAUSE_TIME * 1.2)

def is_element_present(driver, locator_type, locator_value, timeout=None):
    """
    Check if an element is present on the screen.
    
    Args:
        driver: Appium WebDriver instance
        locator_type (str): Type of locator (id, xpath, accessibility id, etc.)
        locator_value (str): Value of the locator
        timeout (int, optional): Maximum time to wait for the element
        
    Returns:
        bool: True if element is present, False otherwise
    """
    if timeout is None:
        timeout = config.IMPLICIT_WAIT_TIME
        
    # Store original implicit wait
    original_wait = driver.implicitly_wait
    
    try:
        # Set a short implicit wait for this check
        driver.implicitly_wait(timeout)
        
        if locator_type == 'id':
            element = driver.find_element_by_id(locator_value)
        elif locator_type == 'xpath':
            element = driver.find_element_by_xpath(locator_value)
        elif locator_type == 'accessibility id':
            element = driver.find_element_by_accessibility_id(locator_value)
        elif locator_type == 'class name':
            element = driver.find_element_by_class_name(locator_value)
        else:
            logger.error(f"Unsupported locator type: {locator_type}")
            return False
            
        return element.is_displayed()
    except:
        return False
    finally:
        # Restore original implicit wait
        driver.implicitly_wait(original_wait)

def extract_text_from_screen(driver):
    """
    Extract all text visible on the screen.
    
    Args:
        driver: Appium WebDriver instance
        
    Returns:
        list: List of text strings found on screen
    """
    # Get page source
    page_source = driver.page_source
    
    # Extract text using a simple approach
    # This is a basic implementation and might need to be improved
    # based on the actual structure of the YouTube app
    import re
    text_elements = re.findall(r'text="([^"]*)"', page_source)
    
    # Filter out empty strings and duplicates
    text_elements = [text for text in text_elements if text.strip()]
    text_elements = list(set(text_elements))
    
    logger.debug(f"Extracted {len(text_elements)} text elements from screen")
    return text_elements

def contains_ad_indicator(text_list):
    """
    Check if any text in the list contains ad indicators.
    
    Args:
        text_list (list): List of text strings to check
        
    Returns:
        tuple: (bool, str) - Whether an ad indicator was found and the matching text
    """
    for text in text_list:
        for indicator in config.AD_INDICATORS:
            if indicator.lower() in text.lower():
                logger.info(f"Ad indicator found: '{indicator}' in '{text}'")
                return True, text
    
    return False, None

from io import BytesIO 