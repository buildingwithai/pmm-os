<!-- PMM-OS-REACH-TRIM: trimmed by scripts/patch-agent-reach-trim.py. Upstream's version also
     covered Bilibili and Xiaoyuzhou podcasts — China-market channels this plugin does
     not route. See that script for why. -->

# Video & audio

YouTube metadata and subtitles, plus Whisper transcription for anything without them.

**Before reaching here:** `reach.sh yt <url>` and `reach.sh yt-comments <url>` already
wrap the YouTube commands below, and `last30days` pulls YouTube search + transcripts +
comments keylessly as part of a normal run. Use this file for the transcription lane,
which is the part nothing else covers.

## YouTube (yt-dlp)

```bash
# Metadata
yt-dlp --dump-json "URL"

# Subtitles, no video download
yt-dlp --write-sub --write-auto-sub --sub-lang "en" --skip-download -o "/tmp/%(id)s" "URL"
cat /tmp/VIDEO_ID.*.vtt

# Search
yt-dlp --dump-json "ytsearch5:query"

# Top-level comments
yt-dlp --write-comments --skip-download --write-info-json \
  --extractor-args "youtube:comment_sort=top;max_comments=20,20,0" \
  -o "/tmp/%(id)s" "URL"
# comments land in the .info.json `comments` field
```

> **`max_comments=N,all,N` IS A TRAP.** The four fields are
> `total,max_parents,max_replies,max_replies_per_thread`. Measured 2026-07-31 on
> `dQw4w9WgXcQ`: `20,all,20` returned 20 comments of which exactly ONE was top-level —
> the other 19 were replies to it. `20,20,0` returned 20 real top comments. Filter on
> `parent == "root"` as well; a reply is not a top comment.
> **Subtitles:** uploaded tracks extract reliably; auto-generated ones repeat lines
> across cues and need post-processing.
> **Comments:** `--write-comments` scrapes the web player, not the Data API. Some
> comments are missed. yt-dlp exiting 0 with none means the video has none; a non-zero
> exit means the fetch FAILED and must not be reported as "no comments".

## Whisper transcription (the lane nothing else covers)

```bash
agent-reach transcribe "https://www.youtube.com/watch?v=VIDEO_ID"
agent-reach transcribe ./local_audio.mp3 -o /tmp/transcript.txt
```

> Accepts a public http(s) URL or a local audio file only. With `ytsearch5:`, pick a
> concrete video URL from the yt-dlp results first, then transcribe that.
> **Needs a key:** `agent-reach configure groq-key gsk_xxx` (free, console.groq.com) or
> `agent-reach configure openai-key sk-xxx`. Default `auto` falls back groq -> openai.
> **Needs ffmpeg:** `brew install ffmpeg`, then `agent-reach install --env=auto`.
> Output is machine ASR. Never quote it as verbatim speech, and never present a
> translated track as the original audio.
