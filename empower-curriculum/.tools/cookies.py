#!/usr/bin/env python3
"""Decrypt Chromium profile cookies for community.empowerlabs.ai into a curl jar."""
import sqlite3, hashlib, shutil, sys, os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

PROFILE = "/root/.gstack/chromium-profile/Default/Cookies"
TMP = "/tmp/.empower-cookies.db"
JAR = os.environ.get("EMPOWER_JAR", "/tmp/.empower.jar")
KEY = hashlib.pbkdf2_hmac("sha1", b"peanuts", b"saltysalt", 1, 16)
IV = b" " * 16


def dec(blob: bytes, host: str) -> str:
    if not blob:
        return ""
    if blob[:3] not in (b"v10", b"v11"):
        return blob.decode(errors="replace")
    pt = Cipher(algorithms.AES(KEY), modes.CBC(IV)).decryptor()
    out = pt.update(blob[3:]) + pt.finalize()
    pad = out[-1]
    if 1 <= pad <= 16:
        out = out[:-pad]
    if len(out) >= 32 and out[:32] == hashlib.sha256(host.encode()).digest():
        out = out[32:]
    return out.decode("utf-8", "replace")


shutil.copy(PROFILE, TMP)
con = sqlite3.connect(TMP)
rows = con.execute(
    "select host_key,name,encrypted_value,path from cookies where host_key like '%empowerlabs%'"
).fetchall()
with open(JAR, "w") as f:
    f.write("# Netscape HTTP Cookie File\n")
    for host, name, val, path in rows:
        flag = "TRUE" if host.startswith(".") else "FALSE"
        f.write(f"{host}\t{flag}\t{path or '/'}\tTRUE\t2000000000\t{name}\t{dec(val, host)}\n")
os.chmod(JAR, 0o600)
os.remove(TMP)
print(f"{JAR}: {len(rows)} cookies", file=sys.stderr)
