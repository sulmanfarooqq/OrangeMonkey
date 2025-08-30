import requests
import os
import time
import sys
from urllib.parse import urlparse
from bs4 import BeautifulSoup

def create_audio_directory():
    # Create audio directory if it doesn't exist
    if not os.path.exists("audio"):
        os.makedirs("audio")
        print("Created 'audio' directory for downloads")

def download_audio(url, filename):
    # Download audio file from URL
    try:
        print(f"Downloading {filename}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, timeout=30, headers=headers)
        response.raise_for_status()
        
        filepath = os.path.join("audio", filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"Successfully downloaded: {filename}")
        return True
    except Exception as e:
        print(f"Failed to download {filename}: {str(e)}")
        return False

def extract_track_id(epidemic_url):
    # Extract track ID from EpidemicSound URL
    # Example URL: https://www.epidemicsound.com/track/ihOLYFXRXp/
    path_parts = urlparse(epidemic_url).path.split('/')
    for part in path_parts:
        if part and len(part) > 5:  # Track IDs are typically longer than 5 characters
            return part
    return None

def get_real_download_url(epidemic_url):
    # Scrape the EpidemicSound track page to find the real download URL
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(epidemic_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # The real download URL might be in a <source> tag or in a script tag
        # This is a heuristic and may need adjustment based on actual page structure
        
        # Try to find <audio> tag with <source>
        audio_tag = soup.find('audio')
        if audio_tag:
            source_tag = audio_tag.find('source')
            if source_tag and source_tag.has_attr('src'):
                return source_tag['src']
        
        # Alternatively, search for JSON data or script tags containing URLs
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'mp3' in script.string:
                # Try to extract URL from script content
                import re
                urls = re.findall(r'https?://[^\s"\']+\.mp3', script.string)
                if urls:
                    return urls[0]
        
        print("Could not find real download URL on the page")
        return None
    except Exception as e:
        print(f"Error scraping download URL: {str(e)}")
        return None

def process_single_url(epidemic_url):
    # Process a single EpidemicSound URL
    try:
        if "epidemicsound.com/track/" not in epidemic_url:
            print(f"Invalid EpidemicSound URL: {epidemic_url}")
            return False
            
        print(f"Processing: {epidemic_url}")
        
        # Extract the track ID
        track_id = extract_track_id(epidemic_url)
        if not track_id:
            print("Could not extract track ID from URL")
            return False
            
        # Get the real download URL by scraping
        real_url = get_real_download_url(epidemic_url)
        if not real_url:
            print("Failed to get real download URL")
            return False
        
        # Create a filename
        filename = f"{track_id}.mp3"
        
        # Download the real audio file
        success = download_audio(real_url, filename)
        return success
        
    except Exception as e:
        print(f"Error processing URL {epidemic_url}: {str(e)}")
        return False

def process_urls_from_file(filepath):
    # Process multiple URLs from a text file
    try:
        with open(filepath, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        
        print(f"Found {len(urls)} URLs in file")
        success_count = 0
        
        for i, url in enumerate(urls, 1):
            print(f"\nProcessing URL {i}/{len(urls)}")
            if process_single_url(url):
                success_count += 1
            # Add a small delay to be respectful to the server
            time.sleep(1)
            
        print(f"\nCompleted! Successfully processed {success_count}/{len(urls)} files")
        return success_count > 0
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return False
    except Exception as e:
        print(f"Error reading file {filepath}: {str(e)}")
        return False

def show_help():
    # Display help information
    print("""
EpidemicSound Downloader CLI

Usage:
  python epidownloader.py [option] [value]

Options:
  -u, --url URL              Process a single track URL
  -f, --file FILE_PATH       Process multiple tracks from a text file
  -h, --help                 Show this help message

Examples:
  python epidownloader.py -u https://www.epidemicsound.com/track/C1NBnuRVOC/
  python epidownloader.py -f urls.txt
    """)

def main():
    # Main function
    create_audio_directory()
    
    # Get user input for URL or file path
    print("Enter 'u' to input a single EpidemicSound track URL")
    print("Enter 'f' to input a file path containing multiple URLs")
    choice = input("Your choice (u/f): ").strip().lower()
    
    if choice == 'u':
        url = input("Enter the EpidemicSound track URL: ").strip()
        process_single_url(url)
    elif choice == 'f':
        filepath = input("Enter the path to the text file with URLs: ").strip()
        process_urls_from_file(filepath)
    else:
        print("Invalid choice. Please enter 'u' or 'f'.")
        show_help()

if __name__ == "__main__":
    main()
