#!/usr/bin/env python3
"""Adapter: configures siteapi for this one site.

Named siteconf, NOT site - `site` is a Python stdlib module that is already in
sys.modules at interpreter startup, so an adapter called site.py is unreachable.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import siteapi  # noqa: E402

BASE = "https://www.skool.com"
SITE = "corey"                       # short name, used for jar/creds env vars
SITE_TITLE = "Corey Ganim — AI Operator Hub"                # human name for the README title

siteapi.configure(
    base=BASE,
    jar=os.environ.get(f"{SITE.upper()}_JAR", f"~/.{SITE}/jar.txt"),
    creds=os.environ.get(f"{SITE.upper()}_CREDS", f"{SITE}-creds.md"),
)

#: Auth path. "form" POSTs credentials; "harvest" lifts cookies out of a
#: logged-in Chromium profile (OAuth / magic link / Circle / Cloudflare).
AUTH = "form"

#: Only for AUTH = "harvest": the cookie host_key substring to match.
HARVEST_DOMAIN = "corey"

#: A private endpoint used to prove the session is alive. Must 401 without
#: cookies - a public endpoint proves nothing (see SKILL.md §1).
ME_ENDPOINT = "/api/TODO-me-endpoint"

#: endpoint -> raw-json filename. Fill this in after recon (SKILL.md step 1).
ENDPOINTS = {
    # "meetings.json": "/api/meetings",
}

#: hosts whose links are dead upstream; flagged inline in the Markdown.
DEAD_HOSTS = ()


def login():
    """Get a live session jar. Dispatches on AUTH; prints no secret values."""
    if AUTH == "harvest":
        import cookies
        n = cookies.harvest(HARVEST_DOMAIN, siteapi.JAR)
        print(f"harvested {n} cookies -> {siteapi.JAR}")
        if n == 0:
            sys.exit("no session in the browser profile - log in via /browse first")
        return None
    who = siteapi.form_login(mapping={"username": "email", "password": "password"})
    print(who)
    return who


def alive():
    """True when the session still works. Used by fetch_all before a crawl."""
    return siteapi.get_json(ME_ENDPOINT) is not None


if __name__ == "__main__":
    login()
    print("session alive:", alive())
