# Phase 2: Backend Integration Guide

## Overview
The frontend 4-step workflow is complete and ready for backend integration. This document outlines what needs to be implemented in the Python MCP server to make all features fully functional.

## Current State vs Required State

### YouTube Audio Extraction
**Current State:**
- ✓ Extracts YouTube URL from 4 formats (watch, shorts, youtu.be, embed)
- ✓ Fetches metadata: title, thumbnail, duration
- ✗ No actual audio download
- ✗ No audio file storage

**Required State:**
- Download actual audio file from YouTube
- Store in cloud (S3/Firebase)
- Generate signed URL for download
- Pass audio data to video composition

**Implementation:**
```python
# youtube_extractor.py - NEEDS IMPLEMENTATION
import yt_dlp
import boto3

async def download_youtube_audio(youtube_url: str) -> dict:
    """
    Download audio from YouTube and store in S3
    
    Returns:
    {
        'videoId': 'xxx',
        'title': 'Video Title',
        'audio_url': 's3://bucket/audio-xxx.mp3',
        'duration': 120,
        'thumbnail': 'url'
    }
    """
    # 1. Extract video ID
    # 2. Download audio using yt-dlp
    # 3. Convert to MP3 if needed
    # 4. Upload to S3
    # 5. Generate signed URL (valid 7 days)
    # 6. Return metadata

async def process_audio_file(file_data: bytes, filename: str) -> dict:
    """
    Process uploaded audio file and store in S3
    
    Returns:
    {
        'audio_url': 's3://bucket/audio-xxx.mp3',
        'duration': 120,
        'filename': 'original.mp3'
    }
    """
    # 1. Validate file type
    # 2. Get duration using ffprobe
    # 3. Upload to S3
    # 4. Return metadata
```

### Video Composition
**Current State:**
- ✓ UI for uploading multiple videos
- ✓ Duration extraction
- ✓ Reordering interface
- ✗ No composition logic
- ✗ Videos not included in export

**Required State:**
- Compose multiple video clips in sequence
- Scale/crop videos to uniform size
- Apply transitions between clips
- Synchronize with audio track
- Render final MP4

**Implementation:**
```python
# video_builder.py - NEEDS MAJOR ENHANCEMENT
import ffmpeg
from typing import List

async def compose_videos(
    videos: List[dict],  # [{url, duration}, ...]
    output_format: str = 'mp4'
) -> str:
    """
    Compose multiple video clips into one continuous video
    
    Process:
    1. Download each video file
    2. Normalize resolution to 1920x1080
    3. Apply aspect ratio correction
    4. Chain clips with transitions
    5. Encode to target format
    
    Returns: path to composed video
    """
    pass

async def add_video_to_composition(
    background_video: str,  # Path to background video
    overlay_content: dict,  # Quotes, images, timing
    effects: dict,  # Transition effects
) -> str:
    """
    Composite images/quotes over video background
    
    Process:
    1. Load video
    2. For each quote image:
       - Resize to fit video
       - Apply animation/effect
       - Render onto video frame
    3. Export final video
    
    Returns: path to final video
    """
    pass
```

### Slideshow Effects Rendering
**Current State:**
- ✓ 8 effects defined (Fade, Zoom, Pan, Rotate, Blur-to-Focus, Flip, Slide-Left, Slide-Right)
- ✓ Effect parameters configurable
- ✓ CSS preview in browser
- ✗ Not rendered in MP4 export
- ✗ Effects lost in final video

**Required State:**
- Render effects into video frames using FFmpeg filters
- Apply effects during quote slideshow composition
- Synchronize effect duration with quote timing
- Support custom parameters per effect

**Implementation:**
```python
# effects_engine.py - NEW FILE

class SlideShowEffects:
    """Render slideshow effects using FFmpeg"""
    
    EFFECTS = {
        'fade': {
            'filter': '[prev]fade=t=out:st={start}:d={duration}[out]; [out][curr]blend=all_expr=A*(1-P)+B*P',
            'params': {'duration': 0.5}
        },
        'zoom': {
            'filter': 'scale=iw*({zoom}):ih*({zoom})',
            'params': {'zoom': 1.2, 'min': 1.0, 'max': 2.0}
        },
        'pan': {
            'filter': 'crop=iw:ih:x={pan_x}:y={pan_y}',
            'params': {'pan_speed': 20}
        },
        'rotate': {
            'filter': 'rotate=angle={degrees}*PI/180',
            'params': {'degrees': 5}
        },
        'blur_to_focus': {
            'filter': 'boxblur=r={blur}:enable=\'isnan(prev_selected_t)+gte(t\,prev_selected_t+0.5)\'',
            'params': {'blur': 20}
        },
        'flip': {
            'filter': 'transpose=1,transpose=1',  # Double transpose = vertical flip
            'params': {}
        },
        'slide_left': {
            'filter': 'hstack=inputs=2:gap=0',  # Slide in from right
            'params': {}
        },
        'slide_right': {
            'filter': 'hstack=inputs=2:gap=0',  # Slide in from left
            'params': {}
        }
    }
    
    async def apply_effect(
        self,
        image_path: str,
        effect: str,
        duration: float,
        params: dict = None
    ) -> str:
        """Apply effect to image and export as video"""
        # 1. Load image
        # 2. Get effect filter string
        # 3. Apply parameters
        # 4. Render video for duration
        # 5. Return path to video
        pass

async def render_slideshow_with_effects(
    quotes_with_images: List[dict],  # [{image, duration, effect, effect_params}, ...]
    duration_per_quote: float,
    transition_effect: str,
    effect_params: dict
) -> str:
    """
    Render quote slideshow with transition effects
    
    Process:
    1. For each quote image:
       - Render image as video for specified duration
       - Apply effect if specified
    2. Concatenate all quote videos
    3. Add audio track
    4. Export as MP4
    
    Returns: path to slideshow video
    """
    pass
```

### Timeline Synchronization
**Current State:**
- ✓ Auto-sync calculation: ratio = audio_duration / content_duration
- ✓ Scales image and video durations proportionally
- ✗ Timing data not passed to backend
- ✗ Export uses default timings

**Required State:**
- Pass timing configuration to video builder
- Apply calculated durations during composition
- Synchronize audio with extended/compressed content

**Implementation:**
```python
# video_builder.py - TIMING SECTION

async def apply_timing_configuration(
    composition_config: dict
) -> dict:
    """
    Apply timing configuration to all media elements
    
    Input structure:
    {
        'quotes': [...],
        'imageDuration': 4.5,  # seconds per quote
        'videos': [
            {'id': 123, 'originalDuration': 10, 'scaledDuration': 12.5},
            ...
        ],
        'audioMetadata': {
            'duration': 120,
            'url': 's3://...'
        }
    }
    
    Process:
    1. Calculate quote slideshow duration
    2. Scale each video clip duration
    3. Extend audio if needed (add silence)
    4. Compress/speed-up if needed
    5. Return timing-adjusted composition
    """
    pass
```

### Export API Integration
**Current State:**
- ✓ ExportReview.jsx UI component ready
- ✓ Export options (format, quality) defined
- ✓ File size and time estimates calculated
- ✓ Progress tracking UI prepared
- ✗ No backend API call

**Required State:**
- Call Python MCP server with complete composition config
- Stream progress updates to frontend
- Return download URL when complete

**Implementation:**
```python
# server.py - NEEDS EXPORT ENDPOINT

@mcp.tool()
async def export_quote_video(
    media_config: dict,
    export_options: dict
) -> dict:
    """
    Complete video export pipeline
    
    Input:
    {
        'quotes': [...],
        'audioMetadata': {...},
        'videos': [...],
        'imageDuration': 4.5,
        'config': {
            'theme': 'nature',
            'textColor': '#ffffff',
            'slideshowEffect': 'fade',
            'effectParams': {...}
        },
        'exportOptions': {
            'format': 'mp4',  # or 'webm', 'mov'
            'quality': 'high'  # or 'low', 'medium'
        }
    }
    
    Process:
    1. Download and store all media files
    2. Generate quote images with styling
    3. Render slideshow with effects
    4. Compose with video clips
    5. Add audio track
    6. Apply timing synchronization
    7. Encode to target quality/format
    8. Upload to S3
    9. Generate signed download URL
    
    Returns:
    {
        'success': True,
        'download_url': 's3://...',
        'duration': 120,
        'file_size': '45.5 MB',
        'format': 'mp4'
    }
    """
    pass
```

## Integration Checklist

### 1. YouTube Audio Download
- [ ] Install yt-dlp
- [ ] Implement YouTube audio extraction
- [ ] Add S3 upload functionality
- [ ] Test with various YouTube URL formats
- [ ] Handle errors (age-restricted, region-locked, etc.)
- [ ] Add expiring signed URLs

### 2. Audio File Processing
- [ ] Validate uploaded audio files
- [ ] Extract duration using ffprobe
- [ ] Convert to MP3 if needed
- [ ] Upload to S3
- [ ] Test with various formats (MP3, WAV, M4A)

### 3. Video Composition
- [ ] Download video files from upload URLs
- [ ] Normalize resolution to 1920x1080
- [ ] Implement video concatenation
- [ ] Add transition effects between clips
- [ ] Test with multiple video formats

### 4. Effect Rendering
- [ ] Implement FFmpeg filter generation
- [ ] Test each effect individually
- [ ] Apply custom parameters
- [ ] Chain effects with transitions
- [ ] Optimize rendering performance

### 5. Timeline Synchronization
- [ ] Pass timing config from frontend
- [ ] Calculate scaling ratios
- [ ] Apply speed adjustments to videos
- [ ] Extend/compress audio as needed
- [ ] Test synchronization accuracy

### 6. Image Generation & Styling
- [ ] Generate styled quote images
- [ ] Apply theme colors and fonts
- [ ] Add overlay effects
- [ ] Render to high quality
- [ ] Cache generated images

### 7. Audio Integration
- [ ] Add audio track to video composition
- [ ] Synchronize audio with video duration
- [ ] Handle audio level normalization
- [ ] Test audio sync accuracy

### 8. Export Pipeline
- [ ] Create export API endpoint
- [ ] Implement progress tracking
- [ ] Add quality-specific encoding settings
- [ ] Test all quality/format combinations
- [ ] Implement error handling and recovery

### 9. Storage & Download
- [ ] Configure S3 bucket
- [ ] Implement file upload
- [ ] Generate signed URLs
- [ ] Set expiration (7 days)
- [ ] Implement cleanup of old files

### 10. Testing
- [ ] Unit tests for each function
- [ ] Integration tests for full pipeline
- [ ] Error handling tests
- [ ] Performance tests
- [ ] Edge case tests

## Development Environment Setup

```bash
# Install required packages
pip install yt-dlp
pip install ffmpeg-python
pip install boto3
pip install python-multipart

# Configure AWS credentials
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export AWS_DEFAULT_REGION=us-east-1

# Test setup
cd quote-video-generator-mcp
python -m pytest tests/
```

## Key Dependencies

```
python-dotenv==0.21.0
yt-dlp==2024.01.30
ffmpeg-python==0.2.1
boto3==1.26.137
Pillow==9.5.0
numpy==1.24.3
```

## Architecture Diagram

```
Frontend (React)
    ↓ (mediaConfig)
┌─────────────────────────────────┐
│ export_quote_video()            │
│ (Python MCP Server)             │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 1. Download Media               │
│    - YouTube audio              │
│    - Uploaded videos            │
│    - Uploaded images            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 2. Generate Images              │
│    - Style quote images         │
│    - Cache generated images     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. Render Slideshow             │
│    - Apply effects              │
│    - Add transitions            │
│    - Set duration per image     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 4. Compose Videos               │
│    - Overlay videos             │
│    - Add effects                │
│    - Synchronize timing         │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 5. Add Audio                    │
│    - Sync with video            │
│    - Normalize levels           │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 6. Encode                       │
│    - Apply quality settings     │
│    - Convert to format          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 7. Upload & Generate URL        │
│    - Upload to S3               │
│    - Create signed URL          │
│    - Return download link       │
└─────────────────────────────────┘
    ↓
Frontend (React)
    ↓ (download_url)
User Downloads Video
```

## Performance Considerations

1. **Parallel Processing:**
   - Download multiple media files simultaneously
   - Process multiple quote images in parallel
   - Use asyncio for I/O operations

2. **Caching:**
   - Cache generated quote images
   - Cache downloaded media files
   - Cache FFmpeg filter compilations

3. **Optimization:**
   - Use hardware acceleration for encoding (CUDA/AMD)
   - Pre-process videos to minimize encoding time
   - Stream output instead of buffering

4. **Monitoring:**
   - Log progress for long operations
   - Track encoding speed
   - Monitor S3 usage and costs

## Security Considerations

1. **Input Validation:**
   - Validate all URLs
   - Check file types and sizes
   - Sanitize metadata

2. **File Security:**
   - Use temporary directories for processing
   - Clean up after completion
   - Validate file integrity

3. **URL Security:**
   - Use signed URLs with expiration
   - Implement rate limiting
   - Log download access

4. **Error Handling:**
   - Never expose internal paths in errors
   - Log errors securely
   - Implement retry logic

---

**Status:** 📋 **PLANNING PHASE**
**Complexity:** High
**Estimated Time:** 40-60 hours
**Priority:** High (Required for full functionality)

This is the critical path to make the frontend redesign fully functional.
