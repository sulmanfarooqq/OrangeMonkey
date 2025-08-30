# EpidemicSound Downloader CLI

A command-line tool to download music tracks from EpidemicSound using the Fetchpik service.

## Features

- Download a single track by providing a URL
- Download multiple tracks from a text file containing URLs
- Automatically organizes downloaded audio files in an "audio" directory

## Prerequisites

- Python 3.6 or higher
- pip (Python package installer)

## Installation

1. Navigate to the "sound downloader" directory:
   ```
   cd "sound downloader"
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

## Usage

### Download a single track:
```
python epidownloader.py 
select u 
```

### Download multiple tracks from a file:
```
python epidownloader.py  
 select f 
```

### Show help:
```
python epidownloader.py -h
```

## File Format for Batch Downloads

Create a text file with one EpidemicSound URL per line:
```
https://www.epidemicsound.com/track/TRACK_ID_1/
https://www.epidemicsound.com/track/TRACK_ID_2/
https://www.epidemicsound.com/track/TRACK_ID_3/
```

## Output

All downloaded audio files will be saved in the "audio" directory, which is automatically created when you run the script.

## Note

This tool creates minimal valid MP3 files for demonstration purposes. In a real implementation, you would need to:

1. Send requests to the actual Fetchpik service
2. Parse the response to extract the real download URLs
3. Replace the `process_single_url()` function with actual download logic

The current implementation demonstrates the complete workflow and creates files that will be recognized as valid MP3 files by media players.