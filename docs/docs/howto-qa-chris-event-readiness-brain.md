# How to QA the Chris Event Readiness Brain

Use this guide to verify that the static prototype loads, renders, and responds correctly.

## Prerequisites

- Run commands from the repository root.
- Python 3 is available.
- GStack browse is installed at `/root/.claude/skills/gstack/browse/dist/browse`.
- The Playwright headless shell exists at `/root/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell`.

## Steps

1. Start a local static server.

   ```bash
   cd site
   python3 -m http.server 4174 --bind 127.0.0.1
   ```

   Keep this process running while you test.

2. Open the prototype with GStack browse.

   ```bash
   B=/root/.claude/skills/gstack/browse/dist/browse
   "$B" goto "http://127.0.0.1:4174/chris-event-readiness-brain.html"
   "$B" wait --networkidle
   ```

3. Check for console errors.

   ```bash
   "$B" console --errors
   ```

   Expected result:

   ```text
   (no console errors)
   ```

4. Check that all answer buttons update the assistant.

   ```bash
   "$B" js "['hesitation','fit','logistics','refusal'].map(key => { document.querySelector('[data-answer=' + key + ']').click(); return {key, title: document.querySelector('#questionTitle').textContent}; })"
   ```

   Expected titles:

   - `Registration friction map`
   - `Participant fit check`
   - `Logistics support`
   - `Safe refusal`

5. Check the copy fallback.

   ```bash
   "$B" js "new Promise(resolve => { document.querySelector('#copyButton').click(); setTimeout(() => resolve({label: document.querySelector('#copyButton').textContent, selected: String(window.getSelection()).slice(0,60)}), 100); })"
   ```

   In headless browser, clipboard access can be blocked. A passing fallback result looks like:

   ```json
   {
     "label": "Text selected",
     "selected": "Chris, I mapped the UK Creating Healing Circles registration"
   }
   ```

6. Capture responsive screenshots.

   ```bash
   "$B" responsive /tmp/chris-brain-final
   ```

   Expected files:

   - `/tmp/chris-brain-final-mobile.png`
   - `/tmp/chris-brain-final-tablet.png`
   - `/tmp/chris-brain-final-desktop.png`

7. Check local performance.

   ```bash
   "$B" perf
   ```

   Local serving should load quickly. The implementation QA run measured about `294ms` total load.

## Verification

The prototype passes QA when:

- The page returns HTTP 200.
- The console has no errors.
- All four prompt buttons update the answer title and content.
- The copy button either copies text or selects the close text as a fallback.
- Mobile, tablet, and desktop screenshots show no text overlap.
- The page text includes the UK event, registration friction, `$100` pilot, `$500` path, and safe refusal.

## Troubleshooting

### `ERR_CONNECTION_REFUSED`

The local server is not running.

Start it again:

```bash
cd site
python3 -m http.server 4174 --bind 127.0.0.1
```

### Browse says the Playwright executable is missing

Restore the expected browser cache from the already downloaded Playwright zip if it exists:

```bash
rm -rf /root/.cache/ms-playwright/chromium_headless_shell-1208
mkdir -p /root/.cache/ms-playwright/chromium_headless_shell-1208
unzip -q /tmp/playwright-download-eFVIkp/playwright-download-chromium-headless-shell-ubuntu24.04-x64-1208.zip \
  -d /root/.cache/ms-playwright/chromium_headless_shell-1208
```

Then verify:

```bash
/root/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell --version
```

Expected version from the implementation run:

```text
Google Chrome for Testing 145.0.7632.6
```

### Copy button shows `Text selected`

That is acceptable in headless browser. It means clipboard access was blocked and the fallback selected the message text for manual copy.

### Remote images do not load

The prototype depends on a Chris-hosted image. If that remote asset is unavailable, verify that the text, layout, answer buttons, and pilot message still work.

## Related

- [Chris Event Readiness Brain reference](reference-chris-event-readiness-brain.md)
- [Build the Chris Event Readiness Brain locally](tutorial-chris-event-readiness-brain.md)
- [Why the Chris Event Readiness Brain exists](explanation-chris-event-readiness-brain.md)
