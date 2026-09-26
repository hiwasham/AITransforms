---
title: "Lesson 6: Effective Prompting"
course: "Beginner's Guide to Claude"
section: "How to Use Claude"
lesson_number: 6
section_number: 1
status: "published"
completed: false
lesson_id: 2837867
section_id: 748240
space_id: 2263196
url: "https://community.empowerlabs.ai/c/beginner-s-guide-to-claude/sections/748240/lessons/2837867"
video_url: null
video_title: null
attachments: 0
images: 0
transcript: null
created_at: "2025-09-30T19:34:39.419Z"
updated_at: "2025-09-30T19:35:47.655Z"
fetched_at: "2026-08-28T00:54:13+00:00"
---

# Lesson 6: Effective Prompting

> Beginner's Guide to Claude › Section 1: How to Use Claude › Lesson 6

[Open on Circle](https://community.empowerlabs.ai/c/beginner-s-guide-to-claude/sections/748240/lessons/2837867)

## Content

## 1. Be clear and specific

Clearly state your task or question at the beginning of your message. Provide context and details to help Claude understand your needs. Break complex tasks into smaller, manageable steps.

**Bad prompt**: "Help me with a presentation."

**Good prompt: **"I need help creating a 10-slide presentation for our quarterly sales meeting. The presentation should cover our Q2 sales performance, top-selling products, and sales targets for Q3. Please provide an outline with key points for each slide."

**Why it's better: **The good prompt provides specific details about the task, including the number of slides, the purpose of the presentation, and the key topics to be covered.

---

## 2. Use examples

Provide examples of the kind of output you're looking for. If you want a specific format or style, show Claude an example.

**Bad prompt:** "Write a professional email."

**Good prompt: **"I need to write a professional email to a client about a project delay. Here's a similar email I've sent before:

'Dear [Client], I hope this email finds you well. I wanted to update you on the progress of [Project Name]. Unfortunately, we've encountered an unexpected issue that will delay our completion date by approximately two weeks. We're working diligently to resolve this and will keep you updated on our progress. Please let me know if you have any questions or concerns. Best regards, [Your Name]'

Help me draft a new email following a similar tone and structure, but for our current situation where we're delayed by a month due to supply chain issues."

**Why it's better:** The good prompt provides a concrete example of the desired style and tone, giving Claude a clear reference point for the new email.

---

## 3. Encourage thinking

For complex tasks, ask Claude to "think step-by-step" or "explain your reasoning." This can lead to more accurate and detailed responses.

**Bad prompt: **"How can I improve team productivity?"

**Good prompt: **"I'm looking to improve my team's productivity. Think through this step-by-step, considering the following factors:

1. Current productivity blockers (e.g., too many meetings, unclear priorities)
2. Potential solutions (e.g., time management techniques, project management tools)
3. Implementation challenges
4. Methods to measure improvement

For each step, please provide a brief explanation of your reasoning. Then summarize your ideas at the end."

**Why it's better: **The good prompt asks Claude to think through the problem systematically, providing a guided structure for the response and asking for explanations of the reasoning process. It also prompts Claude to create a summary at the end for easier reading.

---

## 4. Iterative refinement

If Claude's first response isn't quite right, ask for clarifications or modifications. You can always say "That's close, but can you adjust X to be more like Y?"

**Bad prompt:** "Make it better."

**Good prompt:** "That’s a good start, but please refine it further. Make the following adjustments:

1. Make the tone more casual and friendly
2. Add a specific example of how our product has helped a customer
3. Shorten the second paragraph to focus more on the benefits rather than the features"

**Why it's better: **The good prompt provides specific feedback and clear instructions for improvements, allowing Claude to make targeted adjustments instead of just relying on Claude’s innate sense of what “better” might be — which is likely different from the user’s definition!

---

## 5. Leverage Claude's knowledge

Claude has broad knowledge across many fields. Don't hesitate to ask for explanations or background information. Be sure to include relevant context and details so that Claude’s response is maximally targeted to be helpful.

**Bad prompt: **"What is marketing? How do I do it?"

**Good prompt:** "I'm developing a marketing strategy for a new eco-friendly cleaning product line. Can you provide an overview of current trends in green marketing? Please include:

1. Key messaging strategies that resonate with environmentally conscious consumers
2. Effective channels for reaching this audience
3. Examples of successful green marketing campaigns from the past year
4. Potential pitfalls to avoid (e.g., greenwashing accusations)

This information will help me shape our marketing approach."

**Why it's better: **The good prompt asks for specific, contextually relevant information that leverages Claude's broad knowledge base. It provides context for how the information will be used, which helps Claude frame its answer in the most relevant way.

---

## 6. Use role-playing

Ask Claude to adopt a specific role or perspective when responding.

**Bad prompt:** "Help me prepare for a negotiation."

**Good prompt:** "You are a fabric supplier for my backpack manufacturing company. I'm preparing for a negotiation with this supplier to reduce prices by 10%. As the supplier, please provide:

1. Three potential objections to our request for a price reduction
2. For each objection, suggest a counterargument from my perspective
3. Two alternative proposals the supplier might offer instead of a straight price cut

Then, switch roles and provide advice on how I, as the buyer, can best approach this negotiation to achieve our goal."

**Why it's better:** This prompt uses role-playing to explore multiple perspectives of the negotiation, providing a more comprehensive preparation. Role-playing also encourages Claude to more readily adopt the nuances of specific perspectives, increasing the intelligence and performance of Claude’s response.

---

## **7. Specify your audience**

Tell Claude who the content it’s creating is for.

**Bad prompt:** "Write something about cybersecurity."

**Good prompt:** "I need to write a blog post about cybersecurity best practices for small business owners. The audience is not very tech-savvy, so the content should be:

1. Easy to understand, avoiding technical jargon where possible
2. Practical, with actionable tips they can implement quickly
3. Engaging and slightly humorous to keep their interest

Please provide an outline for a 1000-word blog post that covers the top 5 cybersecurity practices these business owners should adopt."

**Why it's better: **The good prompt specifies the audience, desired tone, and key characteristics of the content, giving Claude clear guidelines for creating appropriate and effective output.

---

## **8. Define the tone and style**

If you haven’t added a specific tone and style guide to your Master Prompt, share some guidance for Claude in your prompt.

**Bad prompt:** "Write a product description."

**Good prompt:** "Please help me write a product description for our new ergonomic office chair. Use a professional but engaging tone. Our brand voice is friendly, innovative, and health-conscious. The description should:

1. Highlight the chair's key ergonomic features
2. Explain how these features benefit the user's health and productivity
3. Include a brief mention of the sustainable materials used
4. End with a call-to-action encouraging readers to try the chair

Aim for about 200 words."

**Why it's better: **This prompt provides clear guidance on the tone, style, and specific elements to include in the product description.

---

## **9. Define output structure**

Provide a basic outline or list of points you want covered.

**Bad prompt: "**Create a presentation on our company results."

**Good prompt:** "I need to create a presentation on our Q2 results. Structure this with the following sections:

1. Overview
2. Sales Performance
3. Customer Acquisition
4. Challenges
5. Q3 Outlook

For each section, suggest 3-4 key points to cover, based on typical business presentations. Also, recommend one type of data visualization (e.g., graph, chart) that would be effective for each section."

**Why it's better:** This prompt provides a clear structure and asks for specific elements (key points and data visualizations) for each section.

---

## Troubleshooting, minimizing hallucinations, and maximizing performance

1. **Allow Claude to acknowledge uncertainty**
  - Tell Claude that it should say it doesn’t know if it doesn’t know.
  - Ex. “If you're unsure about something, it's okay to admit it. Just say you don’t know.”
2. **Break down complex tasks**
  - If a task seems too large and Claude is missing steps or not performing certain steps well, break it into smaller steps and work through them with Claude one message at a time.
3. **Include all contextual information for new requests**
  - Claude doesn't retain information from previous conversations, so include all necessary context in each new conversation.
  - Or start a chat in a project which contains all relevant context.

---

*Based on Anthropic’s official prompting guide for Claude. *
