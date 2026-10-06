# F17-3: Video Testimonial Script

**Process:** Proc 17 - Success to Referral  
**Core:** Testimonial & Case Study Capture  
**Owner:** Nasim (interviewer)  
**Duration:** 5-10 minutes (edit to 60-90 seconds)  
**Platform:** Zoom (record to cloud)

---

## Pre-Interview Setup

**Scheduling:**
- Calendly link: 15-minute slots
- Buffer: 5 minutes between calls
- Timezone: Auto-detect from user profile

**Confirmation Email (Auto-sent on booking):**
```
Subject: Video testimonial confirmed — see you [Day] at [Time]

Hi [Name],

Looking forward to our chat on [Day] at [Time] (your time).

What to expect:
- 5-10 minute casual conversation
- I'll ask about your exam journey and how Bayan helped
- No need to prepare or memorize anything — just be yourself

Tech tips:
- Join from a quiet room with good lighting
- Test your camera/mic beforehand
- Zoom link: [Link]

As thanks, we'll add 1 month free to your subscription after we chat.

See you soon!
Nasim

P.S. If you need to reschedule, just use the link in your calendar invite.
```

---

## Interview Script

### Opening (30 seconds)

**Nasim:**
```
Hi [Name]! Thanks for joining me. 

Before we start, just to set expectations: this is super casual. No script, no right answers. I'm just going to ask you a few questions about your exam journey and how Bayan helped.

The video will be 60-90 seconds when we're done editing — we'll send it to you for approval before we publish anything.

Sound good? Let's dive in.
```

**[Wait for confirmation, adjust lighting/audio if needed]**

---

### Question 1: Background (1 minute)

**Nasim:**
```
Let's start with some context. Tell me about your exam journey — which exam did you take, and what was the timeline?
```

**What we're looking for:**
- Exam name (USMLE Step 1, PLAB, MRCPCH, etc.)
- Timeline (how many months of prep)
- Starting point (were they struggling? First attempt? Retake?)

**Follow-up prompts if needed:**
- "How far along were you when you started using Bayan?"
- "Was this your first attempt or a retake?"

---

### Question 2: The Problem (1-2 minutes)

**Nasim:**
```
What was the hardest part about preparing? What were you struggling with before Bayan?
```

**What we're looking for:**
- Specific pain points (not enough practice, weak in OSCEs, disorganized study, expensive alternatives)
- Emotional element (stressed, overwhelmed, didn't know where to start)

**Follow-up prompts:**
- "Had you tried other resources? What was missing?"
- "What made you decide to try Bayan?"

---

### Question 3: The Solution (2-3 minutes)

**Nasim:**
```
How did Bayan help? Which features did you use most?
```

**What we're looking for:**
- Specific features (MCQs, OSCE videos, study plans, mobile app)
- Use patterns (how often, which scenarios)
- Turning point moment ("the thing that clicked")

**Follow-up prompts:**
- "Can you give me an example of how [feature] helped?"
- "Was there a moment when you felt like, 'okay, I've got this'?"
- "What surprised you most about using Bayan?"

---

### Question 4: The Result (1 minute)

**Nasim:**
```
And how did the exam go?
```

**What we're looking for:**
- Result (passed, score if they want to share)
- Confidence level going in vs coming out
- Specific improvements (score increase, sections they aced)

**Follow-up prompts:**
- "How did you feel walking into the exam compared to when you started?"
- "Were there any questions where you thought, 'I saw this in Bayan'?"

---

### Question 5: Recommendation (1 minute)

**Nasim:**
```
Would you recommend Bayan to other medical students? Why?
```

**What we're looking for:**
- Clear yes/no
- Who it's best for (students struggling with X, anyone preparing for Y exam)
- What makes it different from alternatives

**Follow-up prompts:**
- "What would you tell someone who's on the fence about trying it?"
- "If you could only highlight one thing about Bayan, what would it be?"

---

### Closing (30 seconds)

**Nasim:**
```
This is great, [Name]. One last thing — is there anything else you'd like to add? Anything I didn't ask about?
```

**[Let them speak, then close]**

**Nasim:**
```
Perfect. Thank you so much for sharing your story. I'll send you the edited video in a few days for your approval, and we'll add that extra month to your account once we're done.

Congratulations again on passing [exam], and thanks for being part of Bayan!
```

---

## Post-Interview Workflow

### Step 1: Download & Backup (Same Day)
```bash
# Download from Zoom cloud
# Save to: /videos/testimonials/raw/[date]-[name]-raw.mp4
# Backup to Google Drive: Bayan Marketing/Testimonials/Raw
```

---

### Step 2: Edit Video (Within 3 Days)

**Editing Checklist:**

1. **Trim to 60-90 seconds**
   - Keep: strongest problem → solution → result moments
   - Cut: filler words, long pauses, tangents
   - Priority: emotional high points over comprehensive coverage

2. **Add captions**
   - Use Rev.com or Descript for auto-captioning
   - Style: white text, black background, 80% opacity
   - Position: bottom third

3. **Add branding**
   - Opening slate (3 seconds): "[Name], [Specialty], [Exam]"
   - Closing slate (2 seconds): "Bayan.edu.om — Ace Your Medical Exams"
   - Logo: bottom right corner throughout

4. **Audio cleanup**
   - Normalize volume
   - Remove background noise
   - Add subtle background music (royalty-free, low volume)

5. **Export settings**
   - Format: MP4 (H.264)
   - Resolution: 1080p
   - Frame rate: 30fps
   - Aspect ratio: 16:9 (horizontal) or 9:16 (vertical for social)

**Export 3 Versions:**
- Full horizontal (16:9) for YouTube, website
- Square crop (1:1) for Instagram feed
- Vertical crop (9:16) for Instagram Stories, TikTok

---

### Step 3: Send for Approval (Within 4 Days)

**Email:**
```
Subject: Your video testimonial is ready!

Hi [Name],

Here's your edited video testimonial: [Private YouTube link]

A few things to note:
- We trimmed it to 90 seconds and added captions
- We'll publish it on our website and YouTube (if you approve)
- You can share it on your LinkedIn, social media, etc.

Please review and let me know:
1. Are you happy with it as-is?
2. Any edits needed?
3. Final approval to publish?

Once you approve, we'll add the extra month to your subscription (total 2 months free).

Thanks again for sharing your story!

Nasim

[Approve] [Request Changes] [Do Not Publish]
```

**Approval Tracking:**
```python
@app.route('/api/video-approval', methods=['POST'])
def video_approval():
    testimonial_id = request.json['testimonial_id']
    status = request.json['status']  # 'approved', 'changes_requested', 'rejected'
    feedback = request.json.get('feedback', '')
    
    db.execute("""
        UPDATE testimonials
        SET video_status = %s,
            video_feedback = %s,
            video_approved_at = CASE WHEN %s = 'approved' THEN NOW() ELSE NULL END
        WHERE id = %s
    """, [status, feedback, status, testimonial_id])
    
    if status == 'approved':
        # Apply 2nd month reward
        apply_testimonial_reward(testimonial_id, reward_type='video_testimonial')
        
        # Publish video
        publish_video(testimonial_id)
    
    return {'success': True}
```

---

### Step 4: Publish (Within 1 Day of Approval)

**YouTube Upload:**
- Channel: Bayan Official
- Title: "[Name] — How Bayan Helped Me Pass [Exam]"
- Description: Full testimonial text + link to Bayan
- Tags: medical exam prep, [exam name], USMLE, PLAB, medical student
- Thumbnail: Screenshot of [Name] + exam name + "Passed"
- Visibility: Unlisted first, then Public after 24h

**Website Embed:**
- Page: bayan.edu.om/testimonials
- Section: Video testimonials (above text testimonials)
- Layout: Grid, 3 per row
- Card: Video thumbnail + name + exam + "Watch [X]s"

**Social Media:**
- Instagram: Square crop as feed post, vertical crop as Story
- LinkedIn: Horizontal crop, tag [Name] if they have LinkedIn
- Twitter: Horizontal clip with captions burned in

---

### Step 5: Reward Confirmation

**Email (After Publishing):**
```
Subject: Your video is live + 1 more month added 🎉

Hi [Name],

Your testimonial is now live: [YouTube link]

We've added another month to your subscription:
- Previous: [Date]
- New: [Date] (+2 months total)

Thank you for sharing your story. You're helping future medical students see what's possible.

Feel free to share the video on your social media — we've already tagged you on LinkedIn.

Keep crushing it!

Nasim & the Bayan team
```

---

## Quality Control Checklist

**Before Publishing:**
- [ ] Video length: 60-90 seconds
- [ ] Captions: Accurate, no typos
- [ ] Audio: Clear, no background noise
- [ ] Branding: Logo + slates present
- [ ] Approval: Written confirmation from [Name]
- [ ] Reward: 2nd month added to subscription
- [ ] Naming: Consistent across YouTube, website, social

**After Publishing:**
- [ ] YouTube: Video uploaded, description complete
- [ ] Website: Embedded on testimonials page
- [ ] Social: Posted to Instagram, LinkedIn, Twitter
- [ ] User: Notified + tagged where applicable
- [ ] Analytics: Tracking link added to description

---

## Video Testimonial Targets

**Quarterly Goals:**
- Collect: 5-10 video testimonials per quarter
- Publish: 3-5 (after approval filtering)
- NPS 9-10 only: Focus on strongest advocates

**Success Metrics:**
- Approval rate: >80% (willing to be published)
- Edit turnaround: <3 days from recording to approval request
- Social shares: 50%+ of featured students share on their own profiles
- Conversion impact: Track signups from video testimonial landing pages

---

## Edge Cases

**User Nervous on Camera:**
- Offer audio-only testimonial (voice + slides)
- Use their text testimonial with voiceover
- No penalty for declining video — text testimonial reward stands

**User Wants Script:**
- Explain: authenticity is more valuable than polish
- Offer: send questions beforehand so they can think (but not memorize)
- Reassure: we'll edit out any stumbles

**User Failed Exam:**
- Still record if they want to share learning journey
- Focus: what they learned, how they'll approach next time
- Publish only with explicit approval (most won't want to)

**User Wants to Remain Anonymous:**
- Option 1: Audio only (no video)
- Option 2: Video with face blurred + voice altered
- Option 3: Text testimonial only (decline video, keep form reward)
