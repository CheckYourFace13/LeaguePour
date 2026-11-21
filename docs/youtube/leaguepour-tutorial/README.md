# YouTube upload package: LeaguePour tutorial (approved 1:32 main explainer)

Status: **NOT uploaded.** See "Access needed" below.

## Files
| What | File | Notes |
|---|---|---|
| Video (unchanged, owner-approved) | `public/media/demo/lp-main.mp4` | 1920×1080 H.264/AAC, 1:32, 11.5 MB. SHA-1 `c732efe57eb877237d4794bba04f49d715ce2837` |
| Captions (English) | `docs/youtube/leaguepour-tutorial/captions-en.vtt` | Same cues the site serves; upload as "English" subtitles, not auto-sync |
| Thumbnail | `docs/youtube/leaguepour-tutorial/thumbnail.jpg` | 1280×720 JPG, the branded title card at 0:02 of the video |

## Upload settings
- **Channel:** iScream Studio. Check the channel name and handle in YouTube Studio's top-right account menu before publishing. Do not create a new channel.
- **Visibility:** Public
- **Title:** LeaguePour Tutorial | Set Up Leagues & Tournaments Easily
- **Category:** Howto & Style
- **Audience:** No, it's not made for kids
- **Language / caption language:** English
- **Altered or synthetic content:** **Yes.** The voiceover is AI-generated (Kokoro text-to-speech), and YouTube asks creators to disclose realistic synthetic voices. The screen recording itself is real.
- **Tags:** LeaguePour, bar league software, tournament bracket, double elimination bracket generator, bracket maker, league management, dart league, cornhole tournament, pool league, trivia night, round robin schedule, bar tournament
- **License:** Standard YouTube License · **Comments:** on (moderate as usual)

## Description
```
Run bar leagues and tournaments from signup to standings with LeaguePour. This 90-second walkthrough uses a real screen recording with demo data.

▶ Try the free bracket generator (no account needed): https://leaguepour.com/tools/double-elimination-bracket-generator
▶ See how it works: https://leaguepour.com/how-it-works
▶ Start free: https://leaguepour.com

What you'll see:
• The free double elimination bracket generator: type your team names, get winners and losers brackets, and click winners to advance them
• Creating a venue account (name, email, password and venue name, no credit card)
• Setting up a competition: name it, pick the game and choose single elimination or round robin
• Free entry or paid entry fees through Stripe
• A public signup page and QR code. Players register from their phone, no app to download
• Starting the tournament, entering scores, and live standings on the public page or a bar TV scoreboard

Pricing: your first active competition is free with every feature. Paid plans start at $29/month to run more at once, and free events have no fees.

Chapters:
0:00 Free double elimination bracket generator
0:21 Create a venue account
0:32 Create a competition and choose a format
0:48 Publish: public page, QR code and player signup
0:59 Start the tournament, enter scores, live standings
1:15 Pricing and getting started

Voiceover is AI-generated; the app footage is a real screen recording with fictional demo data.

#LeaguePour #BarLeague #TournamentBracket
```

## Access needed (exact blocker, 2026-11-21)
1. The built-in browser used for this work is not signed in to YouTube. studio.youtube.com redirects to accounts.google.com.
2. Uploading a local MP4 needs a browser that can attach a file to YouTube's upload dialog, or the YouTube Data API with an OAuth client authorized for the channel. Neither is set up.

Fastest path: the owner uploads the files above in YouTube Studio (Create → Upload video) using these settings. About 5 minutes.
Alternative: allow Claude in Chrome (your signed-in Chrome, which supports file upload), confirm the iScream Studio channel is selected, and ask for the upload again.

After it's public, the site can link to it: add the URL to `src/lib/demo-videos.ts` (lp-main) and show a "Watch on YouTube" link under the native player. Keep the native player for speed.
