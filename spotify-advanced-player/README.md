# Spotify Advanced Player (Frontend-only)

## Project overview
This is an advanced, realistic music player implemented using only frontend technologies (HTML5, CSS3, vanilla JS). It simulates a backend via `data/songs.json` and uses `localStorage` for likes and recently played.

## Features
- Play / Pause
- Next / Previous
- Seek bar with time update (works with real audio or simulated durations)
- Volume control & Mute
- Repeat modes (off / one / all)
- Shuffle
- Playlist system and rendered list
- Song queue and Up Next
- Recently played stored in localStorage
- Liked songs stored in localStorage
- Mini player mode
- Fullscreen mode
- Smooth song transitions & loading animation
- Dark theme with glassmorphism and modern animations
- Responsive layout

## Folder structure

```
/spotify-advanced-player
│
├── index.html
├── assets/
│   ├── images/    # placeholder SVG covers
│   ├── icons/     # small SVG icons
   └── audio/     # placeholder filenames (replace with real mp3s)
├── data/
│   └── songs.json # acts like backend
├── css/
│   ├── main.css
│   ├── player.css
│   └── animations.css
├── js/
│   ├── app.js
│   ├── player.js
│   ├── playlist.js
│   ├── queue.js
│   ├── storage.js
│   └── animations.js
└── README.md
```

## How to run locally (GitHub Codespaces / any static host)
1. Open the workspace in Codespaces or any local web server.
2. Serve the folder (example using `python`):
```bash
python3 -m http.server 8000
# then open http://localhost:8000/spotify-advanced-player
```
3. Replace placeholder files in `assets/audio/` with real `song1.mp3`..`song8.mp3` to enable real audio playback. The player will still simulate playback durations if real audio metadata is not available.

## Future improvements
- Add search indexing and filter by artist/album
- Add persistent playlists and CRUD operations
- Improve queue UI with drag-and-drop reordering
- Add waveform visualization using WebAudio API
- Replace simulated audio with proper sample MP3s or streaming backend
