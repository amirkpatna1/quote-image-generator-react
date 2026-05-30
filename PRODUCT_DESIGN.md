# 🎬 Quotify - Redesigned Product Flow

## Current Problem
Features are scattered and disconnected. Users have to navigate multiple modals and sections to use audio, videos, and images together.

## Vision
**One seamless workflow** that guides users from raw media → beautiful synced video, with smart defaults and optional customization.

---

## 📊 Redesigned User Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  STEP 1: MEDIA INPUT                                    │
│  "Gather your raw ingredients"                          │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 📝 QUOTES        │  │ 🎬 VIDEO CLIPS   │            │
│  │ (CSV or manual)  │  │ (Optional)       │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 🎵 AUDIO TRACK   │  │ 📸 BG IMAGES    │            │
│  │ (YouTube/File)   │  │ (Auto or manual)│            │
│  └──────────────────┘  └──────────────────┘            │
│                                                           │
│                    [NEXT]                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                           │
│  STEP 2: COMPOSITION & TIMING                           │
│  "Arrange your media"                                   │
│                                                           │
│  Content Duration: 120s                                 │
│  Audio Duration:    180s                                │
│  ⚠️ Duration mismatch!                                 │
│                                                           │
│  [ ✨ AUTO-SYNC TO AUDIO ]  [Manual Adjustment]        │
│                                                           │
│  ┌─────────────────────────────────────────┐           │
│  │ Media Timeline Editor                    │           │
│  │ Quotes (6x @ 4s) ├─────┤               │           │
│  │ Videos (2x)      ├─────────┤           │           │
│  │ Total:           ├────────────────────┤│           │
│  │ Audio:           ├────────────────────┤│           │
│  └─────────────────────────────────────────┘           │
│                                                           │
│                    [NEXT]                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                           │
│  STEP 3: DESIGN & EFFECTS                              │
│  "Make it beautiful"                                    │
│                                                           │
│  Quote Style & Theme                                   │
│  ┌────────────────────────────────────┐                │
│  │ Color theme  [Select]              │                │
│  │ Font style   [Select]              │                │
│  │ Overlay      [On/Off + Opacity]    │                │
│  │ Text align   [Left/Center/Right]   │                │
│  └────────────────────────────────────┘                │
│                                                           │
│  Slideshow Effects (for quote images)                  │
│  ┌────────────────────────────────────┐                │
│  │ Effect: [Fade / Zoom / Pan / etc]  │                │
│  │ Customize → [Adjust parameters]    │                │
│  └────────────────────────────────────┘                │
│                                                           │
│  Video Arrangement                                      │
│  ├─ Quote Slideshow: 6 images × Fade effect           │
│  ├─ Video 1: "intro.mp4" (30s)                        │
│  ├─ Quote Slideshow: 6 images × Fade effect           │
│  └─ Video 2: "outro.mp4" (25s)                        │
│  🔄 [Reorder] [Edit Timing] [Preview]                │
│                                                           │
│  ┌────────────────────────────────────┐                │
│  │  LIVE PREVIEW                      │                │
│  │  [Play video composition preview]   │                │
│  └────────────────────────────────────┘                │
│                                                           │
│                    [NEXT]                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                           │
│  STEP 4: EXPORT                                         │
│  "Create your video"                                    │
│                                                           │
│  ✓ Quotes:       6 images with Fade effect            │
│  ✓ Videos:       2 clips (intro + outro)              │
│  ✓ Audio:        "Song Title" (YouTube)               │
│  ✓ Duration:     180 seconds (3 minutes)              │
│  ✓ Resolution:   1080×1920 (Vertical)                 │
│  ✓ Quality:      High                                  │
│                                                           │
│  Est. File Size: 45MB                                  │
│  Est. Time:      2-3 minutes                           │
│                                                           │
│  [ EXPORT VIDEO ]     [ BACK ]                         │
│                                                           │
│  ✨ Additional Exports:                                │
│  [ Download PNG Images ]  [ Platform Packs ]           │
│                                                           │
└─────────────────────────────────────────────────────────┘

Progress: [████████████████████░] 100%
Status: Ready to export!
```

---

## 🎯 Detailed Page Breakdown

### **STEP 1: MEDIA INPUT**

**Purpose:** Gather all raw media in one unified interface

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  QUOTIFY MEDIA INPUT                                    │
│  Gather all ingredients for your video                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📝 QUOTES (Required)                                   │
│  ───────────────────────────────────────────────────    │
│  Choose how to add quotes:                              │
│                                                           │
│  [📤 Upload CSV]     or    [✏️  Add Manually]          │
│                                                           │
│  CSV Format Expected:                                   │
│  quote,author                                           │
│  "Your quote here","Author Name"                        │
│                                                           │
│  ┌────────────────────────────────────────────────┐    │
│  │ Sample: [Download Template CSV]                │    │
│  │ Pasted CSV Preview:                            │    │
│  │ ┌──────────────────────────────────────────┐  │    │
│  │ │ 3 quotes ready                           │  │    │
│  │ └──────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🎬 VIDEO CLIPS (Optional)                              │
│  ───────────────────────────────────────────────────    │
│  Add video clips to play between quotes (intro/outro)   │
│                                                           │
│  [🎥 Upload Videos] (Max 5 videos, 500MB each)        │
│                                                           │
│  ☐ Include video clips in my video                     │
│                                                           │
│  When checked, shows:                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │ 📹 Drop videos or click to browse              │    │
│  │                                                 │    │
│  │ Uploaded:                                      │    │
│  │ 1. intro.mp4 (30s) [↑↓ ✕]                     │    │
│  │ 2. outro.mp4 (25s) [↑↓ ✕]                     │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🎵 AUDIO TRACK (Optional)                              │
│  ───────────────────────────────────────────────────    │
│  Background music or narration (sets video duration)    │
│                                                           │
│  ☐ Add audio track                                     │
│                                                           │
│  When checked, shows:                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │ YouTube Audio                                   │    │
│  │ [Paste YouTube URL] [Extract]                  │    │
│  │ https://www.youtube.com/watch?v=...            │    │
│  │                                                 │    │
│  │ OR upload MP3 file:                            │    │
│  │ [📁 Upload Audio File]                         │    │
│  │                                                 │    │
│  │ Selected:                                      │    │
│  │ 🎵 "Song Title" (3:45)                        │    │
│  │ [Volume: 70%] [Fade In: 0.5s] [Fade Out: 0.5s]│    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📸 BACKGROUND IMAGES (Optional)                        │
│  ───────────────────────────────────────────────────    │
│  Custom images for quotes (auto-selected if not)        │
│                                                           │
│  ☐ Use custom background images                        │
│                                                           │
│  When checked, shows:                                   │
│  [ Auto-select from Picsum ] or [ Upload Custom ]      │
│                                                           │
│  Or choose theme:                                      │
│  [Nature] [Tech] [Business] [Creative] [Abstract]      │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📋 Summary                                              │
│  ────────────────────────────────────────────────────    │
│  Quotes:     ✓ 3 quotes ready                           │
│  Videos:     ○ Not included                             │
│  Audio:      ✓ YouTube track (180s)                     │
│  Images:     ✓ Auto-selected                            │
│                                                           │
│  [← BACK]                [NEXT →]                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Checkboxes to enable/disable optional features
- ✅ Conditional visibility (show options only when enabled)
- ✅ Clear CSV template
- ✅ Drag-drop for videos and audio
- ✅ Summary showing what's ready
- ✅ Smart defaults (auto-select images if not specified)

---

### **STEP 2: COMPOSITION & TIMING**

**Purpose:** Arrange media and handle duration sync

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  COMPOSITION & TIMING                                   │
│  Arrange your media and sync durations                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ⏱️  DURATION ANALYSIS                                  │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  Audio Duration:      180 seconds (3:00 min)    [🎵]   │
│  ├─ Quotes:          6 × 4s = 24s                      │
│  ├─ Videos:          30s + 25s = 55s                   │
│  └─ Total Content:   79s                                │
│                                                           │
│  ❌ MISMATCH: Audio is 180s, content is 79s             │
│     (Need to extend by 101s)                            │
│                                                           │
│  [✨ AUTO-SYNC NOW] or [Manual Adjustment ▼]           │
│                                                           │
│  After Auto-Sync:                                       │
│  ├─ Quotes:          6 × 13.7s = 82s  ✓               │
│  ├─ Videos:          Sped up to fit    ✓               │
│  └─ Total Content:   180s  ✓ MATCHES AUDIO            │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📊 MEDIA TIMELINE EDITOR                               │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  ┌─ AUDIO TRACK ─────────────────────────────────────┐ │
│  │ 🎵 "Song Title"                                    │ │
│  │ ├──────────────────────────────────────────────┤  │ │
│  │ 0s                                           180s │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ CONTENT TIMELINE ────────────────────────────────┐ │
│  │ Quote Slideshow (82s)                             │ │
│  │ ├──────┤                                          │ │
│  │                                                    │ │
│  │ Video: intro.mp4 (30s → 15s)                     │ │
│  │         ├──────┤                                  │ │
│  │                                                    │ │
│  │ Quote Slideshow (82s)                             │ │
│  │         ├──────┤                                  │ │
│  │                                                    │ │
│  │ Video: outro.mp4 (25s → 12.5s)                   │ │
│  │                  ├───┤                            │ │
│  │ ├──────────────────────────────────────────────┤  │ │
│  │ 0s                                           180s │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  [Reorder Media] [Edit Timing] [Preview]                │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🎬 FINE-TUNE TIMING (Optional)                         │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  Time per Quote Image:                                  │
│  [◄──────●──────►] 13.7 seconds                        │
│  (Range: 1s - 20s)                                      │
│                                                           │
│  Video Playback Speed:                                  │
│  intro.mp4:   [◄──●──►] 2.0x (15s)                    │
│  outro.mp4:   [◄──●──►] 2.0x (12.5s)                  │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [← BACK]                [NEXT →]                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Visual duration mismatch warning
- ✅ One-click Auto-Sync button (prominent)
- ✅ Timeline visualization showing alignment
- ✅ Fine-tuning controls (sliders)
- ✅ Clear calculations shown

---

### **STEP 3: DESIGN & EFFECTS**

**Purpose:** Customize appearance and media transitions

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  DESIGN & EFFECTS                                       │
│  Customize appearance and transitions                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🎨 QUOTE STYLING                                       │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  Visual Theme:                                          │
│  [Nature] [Tech] [Business] [Creative] [Minimal]       │
│                                                           │
│  Fine-tune:                                             │
│  ┌────────────────────────────────────────────────┐    │
│  │ Text Color:      [Color Picker ■]              │    │
│  │ Background:      [Gradient ▼]                  │    │
│  │ Overlay:         [Opacity Slider] 50%          │    │
│  │ Font:            [Select ▼] Bold               │    │
│  │ Text Alignment:  [◉ Center] ○ Left ○ Right    │    │
│  │ Font Size:       [Slider] 100%                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  Live Preview:                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  "Your quote here"                              │    │
│  │  — Author Name                                 │    │
│  │  (With actual background image)                │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ✨ SLIDESHOW EFFECTS (for quote images)               │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  Choose Transition Effect:                              │
│  ┌────────────────────────────────────────────────┐    │
│  │ [⚪ Fade]  [← Slide] [→ Slide] [🔍 Zoom]      │    │
│  │ [↔️  Pan]  [🔄 Rotate] [✨ Blur] [🔀 Flip]   │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  Current: Fade                                          │
│  Description: "Smooth fade between images"              │
│                                                           │
│  Effect Parameters:                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ (Show only if effect has parameters)           │    │
│  │ Zoom Level:    [◄────●────►] 1.5x             │    │
│  │ Pan Speed:     [◄────●────►] 1.0x             │    │
│  │ Blur Amount:   [◄────●────►] 0px              │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  Effect Preview (6 quote images cycling):              │
│  ┌────────────────────────────────────────────────┐    │
│  │ [Image with fade effect]                        │    │
│  │ [Cycling through all quotes]                   │    │
│  │ [Speed: 13.7s per quote]                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🎬 MEDIA ARRANGEMENT                                   │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  How your video plays:                                  │
│                                                           │
│  ┌─ 1. INTRO VIDEO ──────────────────────────┐         │
│  │ 📹 intro.mp4 (15s)                         │         │
│  │ [Play Preview] [Edit] [Remove]             │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  ┌─ 2. QUOTE SLIDESHOW #1 ───────────────────┐         │
│  │ 📸 6 quotes × Fade effect (82s total)      │         │
│  │ [Change Effect] [Edit Timing] [Preview]   │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  ┌─ 3. OUTRO VIDEO ──────────────────────────┐         │
│  │ 📹 outro.mp4 (12.5s)                       │         │
│  │ [Play Preview] [Edit] [Remove]             │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  [↑ Move Up] [↓ Move Down] [+ Add Block]                │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🎥 FULL VIDEO PREVIEW                                  │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [Play Full Composition] (180s video preview)           │
│  This shows exactly what your exported video looks like │
│                                                           │
│  [← BACK]                [NEXT →]                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Grouped controls (styling, effects, arrangement)
- ✅ Live preview at each level
- ✅ Full composition preview
- ✅ Drag-reorder media blocks
- ✅ Easy effect switching

---

### **STEP 4: EXPORT**

**Purpose:** Review and export the final video

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  EXPORT YOUR VIDEO                                      │
│  Review and download                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ YOUR COMPOSITION SUMMARY                            │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  📝 Quotes:                                              │
│     6 quotes × 13.7s each, Fade effect                 │
│     Appears: Start (82s) + End (82s)                   │
│     Theme: Creative, Bold text                          │
│                                                           │
│  🎬 Videos:                                              │
│     intro.mp4 (Start, 15s)                             │
│     outro.mp4 (End, 12.5s)                             │
│                                                           │
│  🎵 Audio:                                               │
│     "Song Title" from YouTube                           │
│     Duration: 180 seconds (entire video)                │
│     Volume: 70%, Fade in/out: 0.5s                     │
│                                                           │
│  📊 Specifications:                                      │
│     Total Duration:  180 seconds (3:00 min)             │
│     Format:          MP4 (H.264 codec)                  │
│     Resolution:      1080×1920 (Vertical)               │
│     Frame Rate:      30 FPS                             │
│     Quality:         High                               │
│     Est. File Size:  ~45MB                              │
│     Est. Processing: 2-3 minutes                        │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🔧 EXPORT OPTIONS                                      │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  Quality:                                               │
│  ○ Low (15MB, Fast)                                     │
│  ◉ High (45MB, Best quality)                            │
│                                                           │
│  Format:                                                │
│  ◉ MP4 (Recommended - All platforms)                    │
│  ○ WebM (Smaller file, less compatible)                 │
│                                                           │
│  Include:                                               │
│  ☑ Video composition                                   │
│  ☑ Audio track                                          │
│  ☐ Subtitles (Coming soon)                             │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📦 ADDITIONAL DOWNLOADS                                │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [ 📷 Download Quote Images as ZIP ]                    │
│  Export all 6 quote images separately (for social media)│
│                                                           │
│  [ 🎨 Platform-Specific Packs ]                        │
│  Instagram Reels / TikTok / YouTube Shorts formats     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [ 🚀 EXPORT VIDEO ]    [ ← BACK ]                     │
│                                                           │
│  Once clicked, shows progress:                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Encoding video...  🔨 🎬                        │    │
│  │ [████████████──────────────────] 45%            │    │
│  │ Estimated time remaining: 1m 30s                │    │
│  │                                                 │    │
│  │ Processing:                                    │    │
│  │ ✓ Composing images                             │    │
│  │ ⟳ Encoding video (45%)                         │    │
│  │ ○ Syncing audio                                │    │
│  │ ○ Finalizing                                   │    │
│  │                                                 │    │
│  │ Do not close this window                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  After complete:                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │ ✅ VIDEO READY!                                │    │
│  │                                                 │    │
│  │ quotify-video-20250530.mp4                      │    │
│  │ 45MB • 3:00 minutes • 1080×1920                 │    │
│  │                                                 │    │
│  │ [ ⬇ DOWNLOAD ] [ 📤 SHARE ] [ 📋 COPY LINK ]  │    │
│  │                                                 │    │
│  │ What next?                                     │    │
│  │ [ Create Another ] [ View in Gallery ]         │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Complete summary of what's being exported
- ✅ Specifications clearly displayed
- ✅ Export options (quality, format)
- ✅ Progress tracking with estimated time
- ✅ Alternative download options
- ✅ Next steps suggestions

---

## 🎯 Implementation Priorities

### **Phase 1: Core Integration**
1. Restructure Step 1 with checkboxes for each media type
2. Consolidate Steps 2-3 into composition view
3. Unify export into one final step

### **Phase 2: Polish**
1. Add full video preview
2. Improve timeline visualization
3. Add drag-reorder for media blocks

### **Phase 3: Advanced**
1. Save projects
2. Share compositions
3. Templates library

---

## 🐛 Bug Fixes Needed

1. **YouTube extraction**: Only gets metadata, not actual audio
   - Need backend service (Python MCP) to download audio
   - Store in cloud storage (S3/Firebase)
   
2. **Video composition**: Not integrated into final export
   - Need FFmpeg composition that includes videos + quotes + audio
   - Current export only does image slideshow
   
3. **Media timeline**: Calculations correct but not applied to export
   - Need to pass timing to video builder
   
4. **Slideshow effects**: Work in preview but not in final MP4
   - Need to render effects into video frames

---

## 📱 Mobile Considerations

- Stack sections vertically
- Full-width inputs
- Touch-friendly sliders
- Simplified preview (smaller)
- Collapse optional sections by default

---

## ✨ Key UX Principles Applied

1. **Progressive Disclosure**: Show features only when relevant
2. **Clear Defaults**: Auto-fill with smart defaults
3. **One Unified Flow**: Not scattered modals
4. **Visual Feedback**: Show status, progress, warnings clearly
5. **Preview Before Export**: See exactly what you'll get
6. **Accessibility**: Alt text, keyboard navigation, high contrast

---

## 🚀 This Design Would Make The App

- ✅ Intuitive and guided (no confusion where to find things)
- ✅ Powerful yet simple (all features accessible from main flow)
- ✅ Professional (feels like a real product)
- ✅ Forgiving (checkboxes make features optional)
- ✅ Confirmable (review before export)
