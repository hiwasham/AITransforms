#!/usr/bin/env python3
"""Log in to members.marketingclub.ai and persist the session cookie jar.

    python3 .tools/login.py            # reads ../eben-pagan-members.marketingclub.ai.md
    MC_CREDS=/path/creds.md python3 .tools/login.py

Credentials file format (never commit it):
    username: <email>
    password: <password>
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mcapi  # noqa: E402

if not os.path.exists(mcapi.CREDS):
    alt = os.path.join(mcapi.ROOT, "..", os.path.basename(mcapi.CREDS))
    if os.path.exists(alt):
        mcapi.CREDS = alt
    else:
        sys.exit(f"credentials file not found: {mcapi.CREDS} (set MC_CREDS)")

who = mcapi.login()
print(f"logged in: {who.get('firstName')} {who.get('lastName')} "
      f"(id {who.get('id')}, admin={who.get('isAdmin')})")
print(f"jar: {mcapi.JAR}")
