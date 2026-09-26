#!/usr/bin/env python3
"""Render the readable participant files from members.json / leaderboard.json / activity.json.

Usage: build_members_index.py

Members who switched OFF "visible in member directory" are kept in the raw JSON
(that is the unmodified API response) but left out of every rendered file — being
listed for outreach is exactly what they opted out of.
"""
import json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "empower-participants")

TIERS = [
    ("Owners & C-suite", re.compile(
        r"\b(founder|co-?founder|owner|ceo|coo|cfo|cto|cmo|cro|cio|chief|president|"
        r"proprietor|managing partner|managing director|md|entrepreneur)\b", re.I)),
    ("Partners, VPs & directors", re.compile(
        r"\b(partner|vp|vice president|director|dir|head of|general manager|gm|principal|"
        r"managing)\b", re.I)),
    ("Managers & operators", re.compile(
        r"\b(manager|mgr|lead|supervisor|superintendent|coordinator|administrator|"
        r"operations|ops)\b", re.I)),
]


def load(name):
    p = os.path.join(OUT, name)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else None


def pi(m):
    return m.get("profile_info") or {}


def links(m, sep=" · "):
    out = [f"[profile]({m['profile_url']})"]
    if pi(m).get("linkedin_url"):
        out.append(f"[LinkedIn]({pi(m)['linkedin_url']})")
    site = pi(m).get("website") or ""
    if site.startswith("http") and "community.empowerlabs.ai" not in site:
        out.append(f"[site]({site})")
    if pi(m).get("facebook_url"):
        out.append(f"[FB]({pi(m)['facebook_url']})")
    return sep.join(out)


def cell(s, limit=70):
    s = re.sub(r"\s+", " ", (s or "").strip()).replace("|", "/")
    return (s[:limit].rstrip() + "…") if len(s) > limit else s


def country(m):
    loc = pi(m).get("location") or ""
    return loc.split(",")[-1].strip() or "—"


def tier_of(m):
    h = m.get("headline") or ""
    for name, rx in TIERS:
        if rx.search(h):
            return name
    return "Everyone else"


def table(rows):
    out = ["| Name | Role | Location | Links | Notes |", "|---|---|---|---|---|"]
    for m in rows:
        out.append(f"| **{cell(m['name'], 40)}** | {cell(m.get('headline'), 46)} "
                   f"| {cell(pi(m).get('location'), 34)} | {links(m)} | {cell(m.get('bio'), 80)} |")
    return out


def write(name, lines):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write("\n".join(lines).rstrip() + "\n")
    print(f"  {name:<20} {len(lines):>5} lines")


def directory_md(vis, when):
    out = ["# Member directory — 428 members", "",
           f"Everyone listed in [community.empowerlabs.ai/members](https://community.empowerlabs.ai/members) "
           f"as of {when}. {len(vis)} of 428 appear here; the rest turned off directory visibility.", "",
           "Sorted by first name, the same as the site. Links go to the Circle profile, "
           "LinkedIn and personal site where the member published them.", ""]
    by_letter = collections.defaultdict(list)
    for m in sorted(vis, key=lambda m: (m["name"] or "").upper()):
        by_letter[(m["name"] or "?")[:1].upper()].append(m)
    for letter in sorted(by_letter):
        rows = by_letter[letter]
        out += [f"## {letter} ({len(rows)})", ""] + table(rows) + [""]
    return out


def leads_md(vis, when):
    by_tier = collections.defaultdict(list)
    for m in vis:
        by_tier[tier_of(m)].append(m)
    out = ["# Leads shortlist — by seniority", "",
           f"The {len(vis)} directory-visible members grouped by what their own headline says. "
           "Heuristic, not gospel: “MD” is read as managing director, and a one-word headline "
           "like “Founder” says nothing about company size.", "",
           f"Fetched {when}. Full records in `members.json`.", ""]
    for name, _ in TIERS + [("Everyone else", None)]:
        rows = sorted(by_tier.get(name, []), key=lambda m: (country(m), m["name"] or ""))
        if not rows:
            continue
        out += [f"## {name} ({len(rows)})", ""]
        with_ctx = [m for m in rows if (m.get("bio") or "").strip()]
        out += table(rows) + [""]
        if with_ctx and name != "Everyone else":
            out += [f"### {name} — the {len(with_ctx)} who wrote a bio", ""]
            for m in with_ctx:
                out += [f"**{m['name']}** — {cell(m.get('headline'), 60)} · "
                        f"{cell(pi(m).get('location'), 40)}", "",
                        f"> {cell(m.get('bio'), 400)}", "", links(m), ""]
    return out


def location_md(vis, when):
    by_country = collections.defaultdict(list)
    for m in vis:
        by_country[country(m)].append(m)
    ranked = sorted(by_country.items(), key=lambda kv: (-len(kv[1]), kv[0]))
    out = ["# Members by country", "",
           f"{len(vis)} directory-visible members across {len(ranked)} countries, "
           f"as of {when}. Useful for timezone-friendly calls and local meetups.", "",
           "| Country | Members |", "|---|---|"]
    out += [f"| {c} | {len(ms)} |" for c, ms in ranked]
    out += [""]
    for c, ms in ranked:
        out += [f"## {c} ({len(ms)})", ""] + table(sorted(ms, key=lambda m: m["name"] or "")) + [""]
    return out


def active_md(vis, lb, act, when):
    seen = {m["id"]: m for m in vis}
    out = ["# Who is actually active", "",
           "Two independent signals: the community's own points leaderboard, and a scan of "
           "every post and comment in the spaces this account can read. People who show up "
           "here answer messages — start with them.", "",
           f"Fetched {when}.", ""]
    if lb:
        out += ["## Points leaderboard", ""]
        titles = {"7_days": "Last 7 days", "30_days": "Last 30 days", "all_time": "All time"}
        for period, rows in lb["periods"].items():
            out += [f"### {titles.get(period, period)} ({len(rows)})", "",
                    "| # | Name | Role | Points | Profile |", "|---|---|---|---|---|"]
            for i, r in enumerate(rows, 1):
                out.append(f"| {i} | **{cell(r.get('name'), 40)}** | {cell(r.get('headline'), 40)} "
                           f"| {r.get('total_points')} | "
                           f"[profile](https://community.empowerlabs.ai/u/{r.get('public_uid')}) |")
            out += [""]
    if act:
        contribs = act["contributors"]
        out += [f"## Posters & commenters ({len(contribs)} people across {act['posts_scanned']} posts)", "",
                "| Name | Role | Location | Posts | Comments | Links |", "|---|---|---|---|---|---|"]
        for a in contribs:
            m = seen.get(a["id"])
            role = cell(m.get("headline"), 38) if m else "_hidden from directory_"
            loc = cell(pi(m).get("location"), 28) if m else ""
            lk = links(m) if m else f"[profile](https://community.empowerlabs.ai/u/{a['public_uid']})"
            out.append(f"| **{cell(a['name'], 34)}** | {role} | {loc} | {a['posts']} | {a['comments']} | {lk} |")
        out += [""]
        out += ["## What each person posted or replied to", ""]
        for a in contribs:
            def plural(n, word):
                return f"{n} {word}" + ("" if n == 1 else "s")
            out += [f"### {a['name']} — {plural(a['posts'], 'post')}, "
                    f"{plural(a['comments'], 'comment')}", ""]
            for it in sorted(a["items"], key=lambda i: i["at"], reverse=True)[:12]:
                out.append(f"- `{it['at']}` {it['kind']} in **{it['space']}** — [{cell(it['title'], 70)}]({it['url']})")
            if len(a["items"]) > 12:
                out.append(f"- _…and {len(a['items']) - 12} more_")
            out += [""]
    return out


def readme_md(members, vis, lb, act, when):
    n_li = sum(1 for m in vis if pi(m).get("linkedin_url"))
    n_site = sum(1 for m in vis if str(pi(m).get("website") or "").startswith("http"))
    n_dm = sum(1 for m in vis if m.get("messaging_enabled"))
    n_bio = sum(1 for m in vis if (m.get("bio") or "").strip())
    countries = len({country(m) for m in vis})
    tiers = collections.Counter(tier_of(m) for m in vis)
    out = ["# EMPOWER Labs — participants", "",
           f"The community's people, pulled from [members](https://community.empowerlabs.ai/members) "
           f"and [leaderboard](https://community.empowerlabs.ai/leaderboard) on {when}. "
           "Built for networking: who they are, where they are, how to reach them, and who is "
           "actually talking.", "",
           "## Numbers", "",
           "| | |", "|---|---|",
           f"| Members in the community | {len(members)} |",
           f"| Listed here (directory-visible) | {len(vis)} |",
           f"| Hidden by their own setting | {len(members) - len(vis)} |",
           f"| With a LinkedIn URL | {n_li} |",
           f"| With a website | {n_site} |",
           f"| With a bio | {n_bio} |",
           f"| Open to direct messages | {n_dm} |",
           f"| Countries | {countries} |",
           f"| Owners & C-suite | {tiers.get('Owners & C-suite', 0)} |",
           f"| Posted or commented anywhere | {len(act['contributors']) if act else 0} |", "",
           "## Files", "",
           "| File | What's in it |", "|---|---|",
           "| [active.md](./active.md) | **Start here.** Points leaderboard plus everyone who has posted or commented, and what about. |",
           "| [leads.md](./leads.md) | The same people grouped by seniority, bios included for the ones who wrote one. |",
           "| [by-location.md](./by-location.md) | Grouped by country, then name — for timezones and local meetups. |",
           "| [directory.md](./directory.md) | Everyone, A→Z. The plain reference copy. |",
           "| `members.json` | Raw API records, all 428, unmodified. |",
           "| `leaderboard.json` | Points for 7 days / 30 days / all time. |",
           "| `activity.json` | Every post and comment found, with author and link. |", "",
           "## How to use it", "",
           "- **Warm intro first.** `active.md` shows what someone posted about; open the "
           "linked thread, reply there, then message them.",
           "- **Leads:** `leads.md` → *Owners & C-suite*, then filter by country in `by-location.md`.",
           "- **Cohort-mates:** the Cohort 4 spaces (Announcements, Discussion) are the "
           "`space` column in `activity.json` — those names are in the class with you.",
           "- **Search across everything:** `grep -i \"real estate\" *.md` or "
           "`python3 -c \"import json;[print(m['name'],'|',m['headline']) for m in "
           "json.load(open('members.json'))['members'] if 'coach' in (m['headline'] or '').lower()]\"`", "",
           "## What is not here, and why", "",
           "- **No email addresses.** Circle only exposes an email when the member has ticked "
           "*make my email public*; none in this community have, so none were collected.",
           f"- **No hidden members.** {len(members) - len(vis)} people turned off "
           "*visible in member directory*. They stay in `members.json` (the untouched API "
           "response) but appear in none of the readable files — being listed for outreach is "
           "the thing they opted out of.",
           "- **No event RSVPs.** The Calendar space serves events through a separate endpoint; "
           "session recordings and materials are already in the curriculum archive.", "",
           "## Refresh", "",
           "```bash",
           "cd /root/projects/empower/empower-curriculum",
           "python3 .tools/fetch_members.py          # re-pull directory, leaderboards, activity",
           "python3 .tools/build_members_index.py    # re-render these Markdown files",
           "```", "",
           "_Cookies come from the Chromium profile via `.tools/cookies.py`; if calls start "
           "returning 401, re-run that first._"]
    return out


def main():
    md = load("members.json")
    if not md:
        sys.exit("members.json missing — run .tools/fetch_members.py first")
    members = md["members"]
    when = md["fetched_at"][:10]
    vis = [m for m in members if m.get("visible_in_member_directory")]
    lb, act = load("leaderboard.json"), load("activity.json")
    write("README.md", readme_md(members, vis, lb, act, when))
    write("active.md", active_md(vis, lb, act, when))
    write("leads.md", leads_md(vis, when))
    write("by-location.md", location_md(vis, when))
    write("directory.md", directory_md(vis, when))
    print(f"\n{len(vis)} of {len(members)} members rendered ({len(members) - len(vis)} hidden by preference)")


if __name__ == "__main__":
    main()
