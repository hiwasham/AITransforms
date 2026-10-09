---
video_id: "owkictxNF4Y"
title: "I Built an AI Voice Agent With Claude + Voiceflow (Zero Code)"
published: "May 12, 2026"
url: "https://www.youtube.com/watch?v=owkictxNF4Y"
transcript: "not captured (bot wall — see GAPS.md)"
---

# I Built an AI Voice Agent With Claude + Voiceflow (Zero Code)

**Published:** May 12, 2026  |  **Views:** ?  |  **Length:** ?

**Watch:** https://www.youtube.com/watch?v=owkictxNF4Y

## Description

Build your voice agent in 10 minutes (no code required)
https://corey-ganim.kit.com/18da152cf4 

I sit down with Susan Westwater, co-founder of Pragmatic Digital and a conversational AI veteran since 2017, to build a working voice agent in Voiceflow from a blank project, no code required. We walk through how to operationalize a repetitive business conversation (in this case an electrician appointment scheduler), how to think about human-in-the-loop vs. on-the-loop autonomy, how to write the agent instructions and knowledge base as two separate documents, and how Voiceflow one-shots the full conversation flow from a single, well-structured prompt. By the end of the episode, you will know exactly how to spin up a production-grade voice agent for your own business in under an hour using a reusable prompt template and a simple Google Sheet integration.

Links:
Voiceflow: https://www.voiceflow.com
Pragmatic Digital: https://www.pragmatic.digital
Vapi: https://vapi.ai
ElevenLabs: https://elevenlabs.io
Voicify: https://www.voicify.ai
Twilio: https://www.twilio.com
Claude: https://claude.ai
ChatGPT: https://chatgpt.com
Make: https://www.make.com
Zendesk: https://www.zendesk.com
Calendly: https://calendly.com

Timestamps
01:08 - Susan's background in conversational AI since 2017
03:42 - Why we're using Voiceflow for this build
04:23 - Chatbot vs. voice agent and the three autonomy levels
06:44 - The first question: what is the impact of a bad decision?
07:13 - Walking through the Brightline appointment use case
09:09 - The two documents: agent instructions vs. knowledge base
11:54 - Speech sculpting and how human you want it to sound
13:22 - Core rules, escalation, and never speculating on safety
17:14 - Why models try to "win the game" and need guardrails
20:31 - One question at a time, explicit confirmation, no apologizing
25:13 - Pasting the full prompt into Voiceflow and hitting generate
26:34 - Voiceflow alternatives: Vapi, ElevenLabs, Voicify
30:22 - Connecting tools like Gmail, Make, and APIs at each step
32:00 - Building the knowledge base as a single source of truth
43:13 - Pushing collected data into Google Sheets, CRM, or anywhere
46:01 - Live call: testing the agent on Susan's phone
49:45 - How fast a small business could ship this
54:10 - Voice cloning, 11 Labs, multilingual support, and brand voices
56:10 - Where to find Susan and Pragmatic Digital

Key Points

The strength of a Voiceflow build lives almost entirely in the prompt. A well-structured agent instructions document covering identity, voice, speech characteristics, conversation flow, qualification, and escalation lets Voiceflow one-shot the full branching logic with no code.

Keep the agent instructions and the knowledge base as two separate documents. Instructions define how the agent behaves; the knowledge base is the source of truth for facts like hours, service area, and pricing rules, so updates only happen in one place.

Explicitly tell the model what NOT to do. Susan repeats "do not troubleshoot electrical issues" multiple times in the prompt because LLMs default to problem-solving and will try to "win the game" if you don't put hard guardrails in.

Bake in a human handoff after two failed attempts at the same field. Janky tug-of-war between a customer and a voice agent destroys trust faster than just escalating to a human.

Section Summaries

1. WHY VOICE AGENTS, AND HOW MUCH AUTONOMY TO GIVE THEM
Susan opens with the framing most people skip: before you build anything, decide where on the autonomy spectrum your agent should sit. 

2. THE TWO DOCUMENTS THAT POWER THE BUILD
Susan walks through her agent instructions doc covering identity, voice, speech characteristics, conversation flow, qualification, escalation, and call management, then contrasts it with the knowledge base, which holds only the facts.

3. ONE-SHOTTING THE FLOW IN VOICEFLOW
Susan pastes the full prompt into a brand-new Voiceflow project and the platform auto-generates the entire conversation flow, branching logic, exit conditions, and tool slots. I unpack how each step has its own mini-prompt, how the knowledge base gets attached, and how tools like Google Sheets, Gmail, Make, and Twilio plug in with a few clicks instead of code.

4. LIVE TEST AND THE PLAYBOOK FOR YOUR OWN BUILD
Susan calls the agent on her own phone and walks through a real appointment-scheduling conversation end to end, including the safety triage, intake, and confirmation. We close on the playbook: take her template into Claude, swap in your business details, paste back into Voiceflow, test in the sandbox, and ship - a small business can realistically have a working voice agent live in under an hour.

FIND ME ON SOCIAL
X/Twitter: https://x.com/GanimCorey
Instagram:   / coreyganim  
LinkedIn:   / coreyganim  

FIND SUSAN ON SOCIAL
X: https://x.com/SJW75
Website: https://www.pragmatic.digital

## Links in description (15)

- https://corey-ganim.kit.com/18da152cf4
- https://www.voiceflow.com
- https://www.pragmatic.digital
- https://vapi.ai
- https://elevenlabs.io
- https://www.voicify.ai
- https://www.twilio.com
- https://claude.ai
- https://chatgpt.com
- https://www.make.com
- https://www.zendesk.com
- https://calendly.com
- https://x.com/GanimCorey
- https://x.com/SJW75
- https://www.pragmatic.digital
