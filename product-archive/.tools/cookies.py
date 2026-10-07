#!/usr/bin/env python3
"""Harvest session cookies out of a logged-in Chromium profile into a curl/urllib jar.

Auth path B: for sites with no usable form login (OAuth, Circle, magic links,
anything behind a SSO wall). Log in once interactively via the gstack browser
(/browse, /connect-chrome), then lift the session here.

    python3 cookies.py community.example.com ~/.example/jar.txt

Requires `cryptography` (the only non-stdlib file in this skill). Chromium on
Linux encrypts cookie values with a fixed PBKDF2 key derived from "peanuts".
"""
import hashlib
import os
import shutil
import sqlite3
import sys

PROFILE = os.environ.get("CHROME_COOKIES_DB",
                         os.path.expanduser("~/.gstack/chromium-profile/Default/Cookies"))
_KEY = hashlib.pbkdf2_hmac("sha1", b"peanuts", b"saltysalt", 1, 16)
_IV = b" " * 16


def _decrypt(blob: bytes, host: str) -> str:
    if not blob:
        return ""
    if blob[:3] not in (b"v10", b"v11"):
        return blob.decode(errors="replace")
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    pt = Cipher(algorithms.AES(_KEY), modes.CBC(_IV)).decryptor()
    out = pt.update(blob[3:]) + pt.finalize()
    pad = out[-1]
    if 1 <= pad <= 16:
        out = out[:-pad]
    # Chrome v10+ prefixes the value with sha256(host) to bind it to the domain.
    if len(out) >= 32 and out[:32] == hashlib.sha256(host.encode()).digest():
        out = out[32:]
    return out.decode("utf-8", "replace")


def harvest(domain_like: str, jar: str, profile: str = PROFILE) -> int:
    """Write every cookie whose host_key matches `domain_like` into a Netscape jar.

    Returns the cookie count. 0 means the profile has no session for that domain:
    log in through the browser first, do not retry this.
    """
    tmp = "/tmp/.harvest-cookies.db"
    shutil.copy(profile, tmp)          # copy: Chrome holds a write lock
    try:
        con = sqlite3.connect(tmp)
        rows = con.execute(
            "select host_key,name,encrypted_value,path from cookies where host_key like ?",
            (f"%{domain_like}%",)).fetchall()
        con.close()
    finally:
        os.remove(tmp)

    os.makedirs(os.path.dirname(jar) or ".", exist_ok=True)
    with open(jar, "w") as f:
        f.write("# Netscape HTTP Cookie File\n")
        for host, name, val, path in rows:
            flag = "TRUE" if host.startswith(".") else "FALSE"
            f.write(f"{host}\t{flag}\t{path or '/'}\tTRUE\t2000000000\t"
                    f"{name}\t{_decrypt(val, host)}\n")
    os.chmod(jar, 0o600)
    return len(rows)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit("usage: cookies.py <domain-like> <jar-path> [profile-db]")
    n = harvest(sys.argv[1], sys.argv[2], *(sys.argv[3:4]))
    print(f"{sys.argv[2]}: {n} cookies", file=sys.stderr)
    if n == 0:
        sys.exit(f"no cookies for '{sys.argv[1]}' in {PROFILE} - log in via the "
                 "browser (/browse) first; this cannot mint a session")
