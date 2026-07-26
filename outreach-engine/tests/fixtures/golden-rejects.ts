/**
 * Golden reject set (specs/001-rule-of-100-outreach/resources/
 * golden-reject-set-2026-07-16.md): the 5 operator-rejected messages from
 * the first real batch, verbatim, with their defect classes. Permanent
 * regression fixtures — the quality gates MUST fail every one (SC-009).
 * A gate change that lets one pass is a regression.
 *
 * `videoUrl` reproduces each package's bfv_link_video at review time: a
 * `<<paste …>>` placeholder — no video existed, which is what makes the
 * appended "I made you a short personal video" claim false (defect D1).
 */

export interface GoldenReject {
  company: string;
  message: string;
  videoUrl: string;
  defects: string[]; // D1–D7 per the resource doc
}

export const GOLDEN_REJECTS: GoldenReject[] = [
  {
    company: "Mozilla",
    defects: ["D1", "D2", "D3", "D7"],
    videoUrl: "<<paste video link for Mozilla>>",
    message:
      "Hi Mitchell, I use Firefox every day, so thank you for that. Here is my thought. " +
      "Mozilla helps people in many languages all over the world. That means a lot of " +
      "questions and bug reports come in each day. Your team must spend hours sorting " +
      "them by hand. AI can read each one, sort it, and answer the easy ones fast. That " +
      "frees your people for the hard work. Can I show you how in a short clip?\n\n" +
      "I made you a short personal video. Watch it here: {{BFV_LINK}}",
  },
  {
    company: "Basecamp",
    defects: ["D1", "D2", "D3", "D7"],
    videoUrl: "<<paste video link for Basecamp>>",
    message:
      "Hi Jason, I saw you pride yourself on great customer service. That is rare these " +
      "days! But I bet your team gets asked the same things a lot, like 'Can I link up " +
      "Google Docs?' or 'Can I hide unfinished work?' That eats up time. I can set up AI " +
      "to answer those fast, so your team can focus on the hard stuff. Can I show you how " +
      "in a quick video?\n\n" +
      "I made you a short personal video. Watch it here: {{BFV_LINK}}",
  },
  {
    company: "Sivers",
    defects: ["D1", "D3", "D5", "D7"],
    videoUrl: "<<paste video link for Sivers>>",
    message:
      "Hi Derek. You met 17 people in Jakarta and 16 in Kuala Lumpur. That is a lot of " +
      "emails to read and sort by hand. I bet it eats up your day. I built a tool that " +
      "reads your emails and lines up your meetups for you, so you keep the real talks " +
      "and skip the busy work. Want to see a quick video of how it works?\n\n" +
      "I made you a short personal video. Watch it here: {{BFV_LINK}}",
  },
  {
    company: "Example Domain",
    defects: ["D1", "D2", "D4", "D7"],
    videoUrl: "<<paste video link for Example Domain>>",
    message:
      "Hi Alex, I saw your site lets people use a domain for docs examples without asking " +
      "first. That is smart. But it can be hard to help every user who has a question " +
      "about using it the right way. What if a smart bot could answer those questions " +
      "fast, all day? Would you be open to a quick chat this week?\n\n" +
      "I made you a short personal video. Watch it here: {{BFV_LINK}}",
  },
  {
    company: "No Website Co",
    defects: ["D1", "D6"],
    videoUrl: "<<paste video link for No Website Co>>",
    message:
      "Hi Jordan, I looked into No Website Co and had an idea to save you time. Worth a " +
      "quick look?\n\n" +
      "I made you a short personal video. Watch it here: {{BFV_LINK}}",
  },
];
