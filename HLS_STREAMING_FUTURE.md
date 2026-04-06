# Future Improvement: HLS Streaming for iPad/Safari Reliability

## Background

The app currently streams video directly from S3 via presigned URLs (MP4 files). Safari on iPad is
notoriously finicky with this approach — it uses aggressive HTTP range requests throughout playback
rather than buffering the full file up front, which can cause mid-video stalls.

Current workarounds in place:
- Presigned URLs extended to 2-hour expiry (was 10 minutes)
- Heartbeat in `VideoPlayerModal.jsx` that detects frozen playback every 5 seconds and attempts
  pause/resume, then auto-advances if still stuck

These help but do not fix the root cause.

---

## The Better Solution: HLS Streaming

HLS (HTTP Live Streaming) is Apple's own streaming format. It breaks video into small chunks
served sequentially rather than one large file. Safari on iPad handles it natively and far more
reliably than direct MP4 streaming. Stalling is essentially eliminated.

### Platform Support

| Platform | HLS Support | How |
|---|---|---|
| Safari on iPad / iPhone | Native | `<video src="file.m3u8">` just works |
| Chrome / Firefox / Edge on PC | Via hls.js library | Lightweight JS, same `.m3u8` URL |
| Chrome / Firefox on Android | Via hls.js library | Same |

### How It Would Work

1. **MediaConvert** (already in use) outputs an additional HLS package alongside the existing MP4
   - Output: a `.m3u8` manifest file + `.ts` chunk files in S3
   - MediaConvert supports this natively — it's a job settings update

2. **Database** — store the HLS manifest key (e.g. `processed/video/{id}/hls/index.m3u8`) in a
   new `hls_key` column on the `media` table

3. **Frontend** — update `VideoPlayerModal.jsx` to detect browser HLS support:
   ```javascript
   const canPlayHLS = video.canPlayType('application/vnd.apple.mpegurl') !== '';
   ```
   - If yes (Safari): set `src` to the presigned `.m3u8` URL directly
   - If no (Chrome, Firefox, Android): initialize hls.js, point it at the same `.m3u8` URL

4. **Presigned URLs** — the `.m3u8` manifest itself needs a presigned URL, but the chunk files
   (`.ts`) also need to be accessible. Options:
   - Make the HLS output prefix publicly readable in S3 (low risk since URLs are not guessable)
   - Or use CloudFront with signed cookies to cover the whole prefix

---

## Files That Would Change

| File | Change |
|---|---|
| `server/lib/mediaconvert.js` | Add HLS output to the MediaConvert job spec |
| `server/routes/media.js` | Return `hls_key` in media query results |
| `server/routes/s3.js` | Presign the `.m3u8` manifest URL |
| `client/src/components/VideoPlayerModal.jsx` | HLS detection + hls.js initialization |
| `client/src/pages/Gallery.jsx` | Pass `hls_key` through to player |
| `client/src/pages/Hilary.jsx` | Same |
| Database migration | Add `hls_key` column to `media` table |

---

## Dependencies to Add

```
npm install hls.js   # client only
```

---

## Why Not Now

- The heartbeat workaround is functioning and auto-recovers from stalls within 5-10 seconds
- HLS requires coordinated changes across MediaConvert, the database, and the frontend
- Existing videos would need to be reprocessed through MediaConvert to generate HLS output
- Worth doing if stalling remains a meaningful problem for Hilary's viewing experience
