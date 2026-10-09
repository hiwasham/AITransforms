---
title: "How to share AI Brain/OS Skills in a Company setting? So that the team can use Claude Code with the files"
author: "post"
source: "https://www.skool.com/aioperatorhub/how-to-share-ai-brainos-skills-in-a-company-setting-so-that-the-team-can-use-claude-code-with-the-files"
comments: 4
upvotes: 1
---
# How to share AI Brain/OS Skills in a Company setting? So that the team can use Claude Code with the files

I know how to create an AI brain, skills, wiki, etc., and for my own business, I have done that and saved everything to a Google Drive folder that is also on my desktop and in the cloud. I also work as a fractional COO integrator for a UK-based company, and we have team members all over the world.
What I want to know is how we set this up in a company setting so that everybody can access the skills. Perhaps there are certain team members who can update skills, while others are just able to use and access them.
For example, we want to create an agent that triages the inbox and drafts replies. We also want an agent that turns blog posts into carousels, maintains brand voice, and manages all sorts of things. How do we share this in a company setting?
Note that we are using Claude. The idea is to get more of the team using Claude Code. At the moment, we have a team account with Claude, and you can share a project folder with Markdown files, etc., which works in Claude Chat and Claude Cowork. However, Claude Code cannot access a central AI brain, for example within Claude itself.

_Posted: 2026-09-15_


## Comments (3 top-level captured)

- **member** (2026-09-15): You've hit a real product boundary, not a gap in your setup. There are two separate distribution systems inside Claude and they don't talk to each other.

Organization settings, Skills and Plugins, pushes to Claude chat, the Desktop chat tab, and Cowork. It does not reach Claude Code. So there's no way to point Claude Code at a brain living inside Claude itself; you found the actual edge.

Claude Code has its own rail: a plugin marketplace, which is just a git repo with a marketplace.json at the root. A plugin can carry skills, subagents, slash commands, hooks, and MCP servers. Your team runs /plugin marketplace add your-org/claude-plugins once and they have the whole stack.

The part that solves your permissions question: move the brain off Google Drive and into a private git repo.

Drive
- **member** (2026-09-16): In a Claude Teams plan, you can create skills at the organization level so that everybody on the Teams plan has access to them.

What you want to create, you can also do inside Claude Cowork, which is probably going to be easier for most regular employees to use.
- **member** (2026-09-16): Hey, Corey. Yes, we have the team plan already and projects which are shared with the team. I guess it's true that there would only be specific team members who would be doing work with Claude Code.

But we're thinking of, for example, automating the inbox management. We do two webinars a month and we get a lot of people emailing in, and currently that team member is managing it through Outlook, not Google Workspace. I've done this for myself through Google Workspace, but I've not done it with Outlook yet. So yeah, we need to figure out how to do that.
  - **member** (2026-09-16): [@Chanelle Segerius-Bruce](obj://user/0107fac01e3948319e40f7923b028fd8) Outlook/Microsoft have a connector and MCP in claude as well

_(comment pagination beyond 25 not exposed to this session — see GAPS.md)_
