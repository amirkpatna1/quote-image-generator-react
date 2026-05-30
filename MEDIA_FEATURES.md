# 🎬 Advanced Media Features

Your Quotify app now includes powerful media creation tools to produce professional videos with quotes, videos, music, and synchronized timing.

## 📋 Features Overview

### 1. 🎵 YouTube Audio Extraction
Extract audio directly from YouTube videos and use it as your video soundtrack.

**How to use:**
1. Go to Step 3 (Gallery) after generating quote images
2. Paste a YouTube URL in the "Extract Audio from YouTube" section
3. The audio metadata will be extracted (title, thumbnail, duration)
4. The extracted audio becomes your soundtrack duration reference

**Supported URLs:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Note:** Audio extraction works via metadata extraction. For full audio download, you may need to use desktop tools like `yt-dlp`.

---

### 2. 🎥 Multi-Video Upload
Upload multiple videos to include alongside your quote images in the final composition.

**How to use:**
1. Click on the "Upload Videos" section
2. Drag and drop up to 5 video files or click to browse
3. Supported formats: MP4, WebM, MOV, AVI, etc. (max 500MB each)
4. Reorder videos using ↑/↓ buttons
5. Remove videos with ✕ button

**Features:**
- ✅ Automatic thumbnail generation
- ✅ Duration detection
- ✅ File size display
- ✅ Drag-and-drop reordering
- ✅ Real-time preview

**Max Videos:** 5 (can be changed in settings)

---

### 3. 📸 Image Slideshow Effects
Choose how your quote images transition and animate during playback.

**8 Built-in Effects:**

| Effect | Icon | Description |
|--------|------|-------------|
| **Fade** | ⚪ | Smooth opacity fade between images |
| **Slide Left** | ← | Images slide from right to left |
| **Slide Right** | → | Images slide from left to right |
| **Zoom In** | 🔍 | Subtle zoom effect (adjustable level) |
| **Pan** | ↔️ | Camera pan across image (adjustable speed) |
| **Rotate** | 🔄 | Image rotation effect (0-360°) |
| **Blur to Focus** | ✨ | Blur fades to sharp focus (adjustable blur) |
| **Flip** | 🔀 | 3D flip transition |

**Customization:**
- Zoom Level: 1.0x to 2.0x
- Pan Speed: 0.5x to 2.0x
- Rotation: 0° to 360°
- Blur Amount: 0px to 20px

**Live Preview:** See your chosen effect applied in real-time before finalizing.

---

### 4. ⏱️ Media Timeline & Duration Sync

Automatically synchronize all media (images, videos, audio) to perfectly match your audio duration.

**Key Features:**

#### Duration Display
- Shows audio duration
- Shows total content duration
- Calculates the difference
- Visual indicators (green = match, blue = needs extension, orange = needs trim)

#### Auto-Sync Button
Intelligently scales all content to match audio length:
- ✨ **Auto-Sync** calculates the ratio needed
- Proportionally adjusts all image display times
- Scales video playback speeds
- Ensures everything fits perfectly

#### Image Timing
- Set time per image (1s to 10s)
- See total calculation: `images × time = total`
- All images get the same duration

#### Video Speed Adjustment
- Adjust playback speed per video (0.5x to 2.0x)
- Original duration → Adjusted duration display
- Speed changes without quality loss

#### Timeline Visualization
Visual representation of:
- Audio duration bar
- Content duration bar
- Easy comparison at a glance

---

## 🎯 Workflow Example

Here's a typical workflow to create a complete video:

```
Step 1: Generate Quote Images
├─ Upload quotes (CSV or manually)
├─ Choose visual style and theme
└─ Generate quote images

Step 2: Add Media (Step 3 Gallery)
├─ Extract audio from YouTube
│  └─ Paste YouTube URL
│  └─ Audio duration is detected
├─ Upload videos (optional)
│  └─ Drag/drop up to 5 videos
│  └─ Reorder as needed
├─ Choose slideshow effect
│  └─ Select fade, zoom, pan, etc.
│  └─ Adjust effect parameters
└─ Sync everything
   └─ View audio duration
   └─ View content duration
   └─ Click "Auto-Sync" if needed

Step 3: Export Final Video
└─ Video composition includes:
   ├─ Quote images with chosen effect
   ├─ Uploaded videos in sequence
   ├─ Audio/music from YouTube
   └─ All perfectly synchronized
```

---

## 📊 Duration Calculation

### Example Scenario

**You have:**
- 5 quote images
- 3 uploaded videos (30s, 45s, 25s each)
- YouTube audio of 3 minutes (180 seconds)

**Content Duration:**
- Images: 5 × 4s (default) = 20 seconds
- Videos: 30 + 45 + 25 = 100 seconds
- **Total: 120 seconds** (2 minutes)

**Problem:** Audio is 180s, content is only 120s

**Solution:** Click "Auto-Sync"
- Ratio needed: 180 ÷ 120 = 1.5x
- New image duration: 4s × 1.5 = 6s per image
- New video speeds: 1.5x playback speed
- **Result:** Everything now totals 180 seconds! ✓

---

## 🎨 Tips & Best Practices

### Audio Selection
- ✅ Use royalty-free music for copyright safety
- ✅ Check that audio duration matches your content length
- ✅ Test audio volume levels before export
- ✅ Prefer clear, high-quality audio files

### Video Selection
- ✅ Keep videos shorter (under 1 minute each)
- ✅ Use consistent aspect ratios (16:9 recommended)
- ✅ Remove long intro/outro sequences
- ✅ Place your best video first for impact

### Image Timing
- ✅ 4-6 seconds per image is ideal for readability
- ✅ Longer images for complex quotes
- ✅ Shorter images for single-word quotes
- ✅ Use consistent timing within a video

### Effects Selection
- ✅ **Fade:** Classic, works for any content
- ✅ **Zoom:** Great for emphasis, builds tension
- ✅ **Pan:** Creates dynamic movement
- ✅ **Rotate:** Use sparingly, can be distracting
- ✅ **Blur-to-Focus:** Dramatic effect for key moments

---

## 🚀 Performance Considerations

### Browser Compatibility
- ✅ Works on Chrome, Firefox, Safari, Edge
- ⚠️ Large videos may require more RAM
- ⚠️ Mobile devices: Keep video count ≤ 2

### File Size Optimization
- Video processing happens client-side (in your browser)
- No file size limits on server
- Output video quality depends on input quality

### Processing Time
- Image slideshow: ~5-10 seconds
- Video composition: ~30-90 seconds (depends on total duration)
- Audio sync: Instant
- Total time: 1-2 minutes for a typical video

---

## ❓ FAQ

**Q: Can I use copyrighted music from YouTube?**
A: Technically extractable, but YouTube's ToS may restrict commercial use. Always verify licensing.

**Q: What video formats are supported?**
A: MP4, WebM, MOV, AVI, FLV, MKV, and more. Maximum 500MB per file.

**Q: Can I adjust individual image timings?**
A: Currently, all images use the same timing. Individual timing coming in next version.

**Q: What happens if I don't click "Auto-Sync"?**
A: Your video will be shorter or longer than your audio. The longest element determines final video length.

**Q: Can I use multiple audio tracks?**
A: Currently supports one audio track. Multi-track support coming soon.

**Q: Can I adjust video playback speed individually?**
A: Yes! Use the speed slider for each video in the Media Timeline.

**Q: What's the maximum video resolution?**
A: Output scales to match your image resolution (typically 1080x1920 for vertical videos).

**Q: Can I preview the final video before export?**
A: The preview in steps 2-3 shows your composition. Full export preview coming soon.

---

## 🔄 Upcoming Features

- 🎵 Multi-track audio mixing
- 🎬 Per-image timing adjustment
- 📱 Vertical video output (9:16) support
- 🎨 Real-time video preview
- 🧵 Advanced composition timeline editor
- 💾 Save projects for later editing
- ☁️ Cloud storage integration

---

## 💡 Need Help?

- Check the main README.md for general features
- See DEPLOYMENT.md for setup instructions
- Report issues on GitHub

**Happy creating!** 🎉
