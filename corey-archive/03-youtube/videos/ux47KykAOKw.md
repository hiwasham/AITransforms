---
video_id: "ux47KykAOKw"
title: "I built an AI agent finance department (full build)"
published: "May 27, 2026"
url: "https://www.youtube.com/watch?v=ux47KykAOKw"
transcript: "not captured (bot wall — see GAPS.md)"
---

# I built an AI agent finance department (full build)

**Published:** May 27, 2026  |  **Views:** ?  |  **Length:** ?

**Watch:** https://www.youtube.com/watch?v=ux47KykAOKw

## Description

I sit down with Mike Dion, a senior corporate finance professional who has helped automate more than 100,000 hours of work out of finance teams over the past decade, to build a full AI agent finance department — live, from scratch — inside N8n. We walk through how to set up an AI CFO named Charles using ChatGPT-generated system prompts, how to wire in specialist sub-agents for FP&A, accounting, and treasury, and how to build in delegation logic so the CFO always routes questions to the right team member. Mike also breaks down model selection strategy for managing API spend, and shows how to publish the whole thing as an embeddable chat your team can actually use. By the end of the episode, you will understand the full architecture of a multi-agent finance department — how to build it, test it, debug it, and deploy it — without writing a single line of code yourself.

Links Mentioned:
OpenAI API: https://platform.openai.com
F9 Finance (Mike's website): https://f9finance.com
F9 Finance YouTube Channel:    / @f9finance  
Finance Automation Insider Newsletter: https://f9finance.com

Timestamps
00:00 – Intro
00:52 – What is N8n and why use it over Zapier or Make
02:00 – Mike's background: finance professional, not a developer
03:30 – Setting up the chat trigger and naming the CFO "Charles"
04:47 – Building the core AI CFO agent node
05:40 – Using ChatGPT to write the system prompt
08:30 – Connecting the OpenAI model and enabling code interpreter
10:10 – Cost management: using stronger models for the CFO, lighter models for sub-agents
11:30 – Adding memory and the thinking tool to the CFO
15:20 – What FP&A is and why it's separate from accounting
21:00 – Why you can't fully outsource your learning to AI
24:45 – Building the treasury agent
27:13 – First live test: routing a rolling forecast question to FP&A
29:04 – Debugging delegation failure and updating the system prompt
33:10 – Second test: routing a cash management question to treasury
36:49 – Publishing the workflow as an embeddable chat
39:22 – Mike's business model: upskilling internal teams, not one-off builds
41:14 – Where to find Mike and the free newsletter

Key Points

• Using ChatGPT to write the system prompt for your N8n agent is not a shortcut — it's a best practice, because nothing knows how to prompt a ChatGPT-backed model better than ChatGPT itself.

• Delegation logic has to be explicitly enforced in the system prompt; left to its own devices, the CFO agent will answer questions itself rather than routing to the specialist, which defeats the entire architecture.

• Code interpreter is essential for any finance agent — LLMs are language models, not calculators, and enabling Python or R execution is what gives them reliable numeric reasoning.

• Teaching your internal team to build and maintain automations beats hiring a consultant to build them for you — businesses change fast, and only your own people can keep the system updated.

Section Summaries

1. BUILDING THE AI CFO FROM SCRATCH IN N8N
Mike opens by explaining N8n's advantages over Zapier and Make — more customizable, free to self-host on a $4/month VPS — then walks through setting up a chat-triggered workflow with an AI agent node as the core CFO. We use ChatGPT to generate the system prompt on the fly, connect an OpenAI GPT-4o model with code interpreter enabled, and add memory and a thinking tool to give the CFO genuine reasoning capability.

2. WIRING IN THE SPECIALIST SUB-AGENTS
I watch Mike add three sub-agents — FP&A, accounting, and treasury — each with its own ChatGPT-generated system prompt, lighter GPT model, code interpreter, and memory. He explains the cost logic behind tiered model selection and walks through how the agent nodes connect so the CFO can delegate to the right specialist depending on the question type.

3. TESTING, DEBUGGING, AND FIXING DELEGATION LOGIC
The first live test reveals the CFO answering questions directly instead of routing them — a common failure mode. Mike shows exactly how to diagnose it, feed the failure back to ChatGPT to get a revised system prompt with stronger delegation instructions, and re-test until the routing works correctly for both FP&A and treasury queries.

4. DEPLOYMENT AND THE UPSKILLING PHILOSOPHY
Mike publishes the workflow as an embeddable chat that any team can access without touching N8n, and explains how to embed it in Slack, Teams, or a company website. He closes with his core philosophy: don't hire consultants to build automations your team can't maintain — train your own people, because they know the business best and can keep the system evolving as the company grows.

FIND ME ON SOCIAL
X/Twitter: https://x.com/coreyganim
Instagram:   / coreyganim  
LinkedIn:   / coreyganim  

FIND MIKE ON SOCIAL
YouTube:    / @f9finance  
Website: https://f9finance.com
LinkedIn:  / dionmichaelc  

## Links in description (5)

- https://platform.openai.com
- https://f9finance.com
- https://f9finance.com
- https://x.com/coreyganim
- https://f9finance.com
