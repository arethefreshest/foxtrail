import logging
from logging.handlers import RotatingFileHandler
import sys
import os

# Create logger
logger = logging.getLogger('foxtrail')
logger.setLevel(logging.INFO)

# Console handler with formatter
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_format)

# Only add file handler if not in production (checking for DO App Platform)
if not os.getenv('DIGITAL_OCEAN_APP_PLATFORM'):
    os.makedirs('logs', exist_ok=True)
    file_handler = RotatingFileHandler(
        'logs/foxtrail.log', 
        maxBytes=10485760, 
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(console_format)
    logger.addHandler(file_handler)

# Always add console handler
logger.addHandler(console_handler) 