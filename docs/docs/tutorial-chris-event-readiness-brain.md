# Build the Chris Event Readiness Brain Locally

You will open the static Chris Event Readiness Brain prototype, test one assistant answer, and confirm the close message is available.

By the end, you will have a local working preview of the page Chris can inspect.

## What You'll Need

- This repository.
- A browser, or GStack browse for automated QA.
- Python 3 if you want to serve the page over local HTTP.

## Step 1: Open the static file

From the repository root, open:

```text
site/chris-event-readiness-brain.html
```

You should see the `UK workshop registration friction brain` page.

The first viewport should show:

- UK workshop price signal: `$1,650`
- UK capacity signal: `40`
- Refund timing signal: `21`
- The assistant panel titled `Ask from the event corpus`

## Step 2: Try an assistant prompt

Click:

```text
Why hesitate?
```

The answer title should change to:

```text
Registration friction map
```

The answer should identify:

- eligibility uncertainty
- lodging booked separately
- USD workshop price vs GBP lodging details
- refund timing
- certificate value
- a gentle follow-up draft

## Step 3: Try safe refusal

Click:

```text
Ask a trick question
```

The answer title should change to:

```text
Safe refusal
```

The answer should say it can only answer from Chris-approved Creating Healing Circles event material.

This is the important trust behavior. The future live assistant should refuse when it does not have a cited source.

## Step 4: Review the $100 pilot message

Scroll to:

```text
The $100 ask
```

Read the message that starts:

```text
Chris, I mapped the UK Creating Healing Circles registration path...
```

This is the copy-ready close message. It frames:

- The event assistant prototype
- Source-grounded answers
- Safe refusal
- The $100 pilot
- The $500 event-support brain
- Refund risk reversal

## Step 5: Serve it locally for QA

If you want the browser QA flow, serve the `site/` directory:

```bash
cd site
python3 -m http.server 4174 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4174/chris-event-readiness-brain.html
```

You now have the same local URL used during GStack browse QA.

## What You Built

You opened and tested a static event-support prototype for Chris Burris.

The prototype demonstrates the product shape for a future sealed-source assistant:

- Answer event fit questions.
- Identify UK registration friction.
- Resolve logistics and fit uncertainty.
- Refuse out-of-scope questions.
- Close a $100 pilot that rolls into a $500 build.

For the full interface details, read the [Chris Event Readiness Brain reference](reference-chris-event-readiness-brain.md).

For automated checks, read [How to QA the Chris Event Readiness Brain](howto-qa-chris-event-readiness-brain.md).
