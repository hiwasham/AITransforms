#!/usr/bin/env python3
"""Who was actually in the Cohort 4 room, from the live-session chat logs and
transcripts already downloaded under 01-cohort-4-curriculum/.

Chat logs are `HH:MM:SS<TAB>Display Name:<TAB>message`; transcripts are WEBVTT
with `Speaker: line`. Both name real attendees, which the member API cannot —
it ignores space filtering for non-admins. Names are matched back to the
directory so each row can carry a profile link.
"""
import collections, glob, json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "empower-participants")

# Display names carry company tags and app suffixes: "Tim | CBH",
# "Beni Hirt, Decomplix", "Jonas Pauly (msg)".
def clean(name):
    n = name.split("|")[0].split(",")[0]
    n = re.sub(r"\((?:msg|she/her|he/him|they/them)[^)]*\)", "", n, flags=re.I)
    n = re.sub(r"\s+", " ", n).strip(" -–—:")
    return n

def key(name):
    n = unicodedata.normalize("NFKD", clean(name).lower())
    n = "".join(c for c in n if not unicodedata.combining(c))
    return re.sub(r"[^a-z ]", "", n).strip()

def session_label(path):
    """`.../05-live-session-4-expansion.../01-...-replay/assets/x.txt` -> Live session 4."""
    parts = path.split(os.sep)
    for p in parts:
        m = re.match(r"\d\d-(live-session-\d+|office-hours-\d+|final-session)", p)
        if m:
            s = m.group(1).replace("-", " ")
            return s[0].upper() + s[1:]
    m = re.search(r"(office.hours.\d+|session.\d+)", path, re.I)
    return m.group(1).title() if m else os.path.basename(path)

CHAT = re.compile(r"^\d\d:\d\d:\d\d\t([^\t]+?):\t(.*)$")
VTT = re.compile(r"^([A-Z][^:]{1,40}):\s+(.+)$")

def parse():
    """-> {name_key: {display, chat, spoke, reacts, sessions:{label:kind}}}"""
    people = collections.defaultdict(
        lambda: {"display": "", "chat": 0, "spoke": 0, "reacts": 0, "sessions": {}})
    files = sorted(glob.glob(os.path.join(ROOT, "01-cohort-4-curriculum", "*", "*", "assets", "*.txt")))
    seen_files = 0
    for path in files:
        base = os.path.basename(path).lower()
        is_chat = "chat" in base
        is_vtt = "transcript" in base
        if not (is_chat or is_vtt):
            continue
        label = session_label(path)
        before = sum(v["chat"] + v["spoke"] + v["reacts"] for v in people.values())
        for line in open(path, encoding="utf-8", errors="replace"):
            line = line.rstrip("\n")
            if is_chat:
                m = CHAT.match(line)
                if not m:
                    continue
                raw, msg = m.group(1), m.group(2)
                field = "reacts" if msg.startswith(("Reacted to", "Removed a")) else "chat"
            else:
                if "-->" in line or line.startswith("WEBVTT") or not line.strip():
                    continue
                m = VTT.match(line)
                if not m:
                    continue
                raw, field = m.group(1), "spoke"
            k = key(raw)
            if not k or len(k) < 3:
                continue
            p = people[k]
            p["display"] = p["display"] or clean(raw)
            p[field] += 1
            p["sessions"].setdefault(label, "chat" if is_chat else "spoke")
        # Six transcripts are unattributed prose with no speaker labels; only
        # count the files that actually named someone.
        if sum(v["chat"] + v["spoke"] + v["reacts"] for v in people.values()) > before:
            seen_files += 1
    return people, seen_files, len(files)


def load_members():
    """-> {name_key: member} from the fetched directory (visible members only)."""
    src = os.path.join(OUT, "members.json")
    if not os.path.exists(src):
        sys.exit(f"missing {src} — run fetch_members.py first")
    idx = {}
    for m in json.load(open(src))["members"]:
        if not m.get("visible_in_member_directory"):
            continue
        idx.setdefault(key(m["name"] or ""), m)
    return idx


def match(name, idx):
    """Display name -> (member, exact?) or (None, False).

    Zoom display names are not directory names: "FM Byers" is Montgomery L
    Byers, "Pavlo" is Pavlo Fediuk. Each loose rule below only fires on a
    UNIQUE candidate, so an ambiguous "Tim" or a surname collision
    ("Jonathan Bruce" vs "Bruce Weyman") stays unmatched rather than wrong.
    """
    k = key(name)
    if k in idx:
        return idx[k], True
    toks = k.split()
    if not toks:
        return None, False

    def only(cands):
        return (cands[0], False) if len(cands) == 1 else (None, False)

    if len(toks) == 1:                                  # first name, must be unique
        return only([m for mk, m in idx.items() if mk.split()[:1] == toks])
    ends = {toks[0], toks[-1]}                          # first+last agree either way
    hits = [m for mk, m in idx.items()
            if ends <= set(mk.split()) or set(mk.split()) <= set(toks)]
    if hits:
        return only(hits)
    return only([m for mk, m in idx.items()             # same surname in last position
                 if mk.split()[-1:] == toks[-1:]])


def where_of(m):
    """Country only — `profile_info.location` is "City, Region, Country"."""
    loc = ((m.get("profile_info") or {}).get("location") or "")
    return loc.split(",")[-1].strip()


def links(m):
    li = (m.get("profile_info") or {}).get("linkedin_url")
    return f" · [LinkedIn]({li})" if li else ""


def row(p, m, exact=True):
    """One table row: name (linked when matched), where they are, headline, activity."""
    name = p["display"]
    if m:
        shown = name if exact else f"{name} → {m['name']}"
        name = f"[{shown}]({m['profile_url']}){links(m)}"
    where = where_of(m) if m else ""
    head = (m.get("headline") or "") if m else ""
    head = re.sub(r"\s*[|·]\s*", " · ", head.replace("\n", " "))[:70]
    bits = []
    if p["spoke"]:
        bits.append(f"spoke ×{p['spoke']}")
    if p["chat"]:
        bits.append(f"chat ×{p['chat']}")
    if p["reacts"]:
        bits.append(f"reacts ×{p['reacts']}")
    sess = ", ".join(sorted(p["sessions"], key=lambda s: (
        0 if s.lower().startswith("live") else 1,
        int(re.search(r"\d+", s).group()) if re.search(r"\d+", s) else 99)))
    return (f"| {name} | {where} | {head} | {len(p['sessions'])} | "
            f"{', '.join(bits)} | {sess} |")


HEAD = ["| Person | Where | Headline | Sessions | Activity | Which |",
        "|---|---|---|---|---|---|"]


def main():
    people, nfiles, ntotal = parse()
    members = load_members()

    # One person can appear under two display names ("Midori" and "Midori
    # Miyamoto"); the matched member is the real identity, so fold on it.
    merged, out_rows = {}, []
    for p in people.values():
        m, exact = match(p["display"], members)
        k = m["id"] if m else key(p["display"])
        if k in merged:
            q = merged[k][0]
            for f in ("chat", "spoke", "reacts"):
                q[f] += p[f]
            q["sessions"].update(p["sessions"])
            if len(p["display"]) > len(q["display"]):
                q["display"] = p["display"]
            continue
        merged[k] = [dict(p, sessions=dict(p["sessions"])), m, exact]

    # Rank by presence: sessions attended first, then how much they said.
    matched = sorted((tuple(v) for v in merged.values()),
                     key=lambda t: (-len(t[0]["sessions"]),
                                    -(t[0]["spoke"] * 3 + t[0]["chat"]), t[0]["display"]))
    hit = [x for x in matched if x[1]]
    miss = [x for x in matched if not x[1]]

    npeople = len(matched)
    out = ["# In the room — Cohort 4 live sessions", "",
           f"Everyone who typed in chat or spoke on a call, read out of the "
           f"{nfiles} attributed chat logs and transcripts in the curriculum "
           f"archive. This is the cohort-mate list the member API cannot give: it "
           f"ignores space filtering for non-admins, so *who is in your class* "
           f"only exists in these files.", "",
           f"*Caveat: {ntotal - nfiles} of the {ntotal} session text files are "
           f"unattributed prose transcripts — no speaker labels, so nobody in them "
           f"is counted. Real attendance is higher than what is below.*", "",
           f"**{npeople} people**, {len(hit)} of them matched to a community "
           f"profile. Sorted by how many sessions they showed up in.", "",
           "*`spoke` counts transcript lines (they were on mic), `chat` counts "
           "messages typed, `reacts` counts emoji reactions — a high `spoke` "
           "number is the warmest possible intro. Josh Cordes and Midori Miyamoto "
           "are the facilitators, which is why their `spoke` counts dwarf everyone "
           "else's; the rest are your cohort-mates.*", "",
           f"## Matched to a profile ({len(hit)})", ""] + HEAD
    out += [row(p, m, e) for p, m, e in hit]
    out += ["", f"## No profile match ({len(miss)})", "",
            "In the room but their display name does not match a directory entry — "
            "a nickname, a company handle, or one of the 70 members who opted out "
            "of the directory.", ""] + HEAD
    out += [row(p, None) for p, _, _ in miss]
    out += [""]

    dest = os.path.join(OUT, "in-the-room.md")
    open(dest, "w", encoding="utf-8").write("\n".join(out))
    print(f"{dest}: {npeople} people ({len(hit)} matched, {len(miss)} unmatched) "
          f"from {nfiles}/{ntotal} attributed files")


if __name__ == "__main__":
    main()
