# WonderWorld

## Current State
Existing project (Brilliance Jewelry) being replaced with a new kids' color-finding quest game.

## Requested Changes (Diff)

### Add
- WonderWorld color quest game UI
- Penguin mascot (Pip) that animates on success
- Camera feed using device camera (getUserMedia)
- Color detection from camera frame using Canvas pixel analysis
- Speech synthesis for game prompts and feedback
- Start Quest button: picks a random color (red, blue, yellow, green) and speaks a prompt
- Show Object button: captures camera frame, analyzes dominant color, checks match
- Reward display: shows success or try-again feedback
- Cheerful gradient background (sky blue to soft yellow)
- Rounded white game card with shadow

### Modify
- Replace all existing app content

### Remove
- All previous jewelry app content

## Implementation Plan
1. Update backend to minimal stub (no specific domain logic needed)
2. Build WonderWorld React component with:
   - Camera hook using useRef + getUserMedia
   - Canvas-based color sampling
   - Web Speech API for voice prompts
   - Penguin mascot image with happy animation class
   - Start and Check buttons
   - Reward/feedback display
3. Apply colorful kids' aesthetic matching the design preview
