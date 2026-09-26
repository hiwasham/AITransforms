# EMPOWER Labs — participants

The community's people, pulled from [members](https://community.empowerlabs.ai/members) and [leaderboard](https://community.empowerlabs.ai/leaderboard) on 2026-09-02. Built for networking: who they are, where they are, how to reach them, and who is actually talking.

## Numbers

| | |
|---|---|
| Members in the community | 428 |
| Listed here (directory-visible) | 358 |
| Hidden by their own setting | 70 |
| With a LinkedIn URL | 137 |
| With a website | 356 |
| With a bio | 109 |
| Open to direct messages | 352 |
| Countries | 42 |
| Owners & C-suite | 154 |
| Posted or commented anywhere | 28 |
| In the live-session room (chat/mic) | 22 |

## Files

| File                               | What's in it                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [in-the-room.md](./in-the-room.md) | **Start here for cohort-mates.** Who actually attended the live sessions, from the chat logs and transcripts. |
| [active.md](./active.md)           | Points leaderboard plus everyone who has posted or commented, and what about.                                 |
| [leads.md](./leads.md)             | The same people grouped by seniority, bios included for the ones who wrote one.                               |
| [by-location.md](./by-location.md) | Grouped by country, then name — for timezones and local meetups.                                              |
| [directory.md](./directory.md)     | Everyone, A→Z. The plain reference copy.                                                                      |
| `members.json`                     | Raw API records, all 428, unmodified.                                                                         |
| `leaderboard.json`                 | Points for 7 days / 30 days / all time.                                                                       |
| `activity.json`                    | Every post and comment found, with author and link.                                                           |

## How to use it

- **Warm intro first.** `active.md` shows what someone posted about; open the linked thread, reply there, then message them.
- **Leads:** `leads.md` → *Owners & C-suite*, then filter by country in `by-location.md`.
- **Cohort-mates:** `in-the-room.md` is the real class list — 22 people read off the session chat logs and transcripts, ranked by how many sessions they showed up in. The member API cannot produce this (it ignores space filtering for non-admins).
- **Search across everything:** `grep -i "real estate" *.md` or `python3 -c "import json;[print(m['name'],'|',m['headline']) for m in json.load(open('members.json'))['members'] if 'coach' in (m['headline'] or '').lower()]"`

## What is not here, and why

- **No email addresses.** Circle only exposes an email when the member has ticked *make my email public*; none in this community have, so none were collected.
- **No hidden members.** 70 people turned off *visible in member directory*. They stay in `members.json` (the untouched API response) but appear in none of the readable files — being listed for outreach is the thing they opted out of.
- **No event RSVPs.** The Calendar space serves events through a separate endpoint; session recordings and materials are already in the curriculum archive.
- **Attendance is a floor, not a total.** 8 of the 19 session text files are unattributed prose transcripts with no speaker labels, so `in-the-room.md` counts only the 11 files that name people. More people were in those calls than it can show.

## Refresh

```bash
cd /root/projects/empower/empower-curriculum
python3 .tools/fetch_members.py          # re-pull directory, leaderboards, activity
python3 .tools/build_members_index.py    # re-render these Markdown files
python3 .tools/build_room_index.py       # re-read the session chat logs into in-the-room.md
```

_Cookies come from the Chromium profile via `.tools/cookies.py`; if calls start returning 401, re-run that first._
