# Groq Whisper setup (for `agent-reach transcribe`)

Speech-to-text for audio and video with no captions. Groq has a free tier that is ample
for research use. `transcribe` is one of the four things agent-reach uniquely adds, so
this is the one vendored guide worth keeping.

## Check whether it is already configured

```bash
agent-reach doctor | grep -i "groq\|whisper"
```

## Configure

```bash
agent-reach configure groq-key gsk_xxx      # free: https://console.groq.com/keys
agent-reach configure openai-key sk-xxx     # alternative; `auto` falls back groq -> openai
```

## Verify

```bash
curl -s https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY" -o /dev/null -w "%{http_code}"
```

`200` means the key works. Anything else is a failed check, not a missing transcript.

## What to tell the user

> Transcribing audio needs a Groq API key, which is free:
> 1. Open https://console.groq.com
> 2. Sign up with Google or email
> 3. "API Keys" -> "Create API Key"
> 4. Paste it back here

## Caveats

Output is machine ASR. Never quote it as verbatim speech, and never present a translated
track as the original audio. `transcribe` accepts a public http(s) URL or a local audio
file only -- for a search result, pick a concrete video URL first.
