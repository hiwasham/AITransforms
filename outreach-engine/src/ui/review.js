/**
 * Review dashboard client (M009, specs/002-operator-review-dashboard
 * MVP-0). Keyboard-first review loop over the /review/* API.
 *
 *   A          approve current prospect
 *   R          reject current prospect
 *   N          next (advance without deciding — never lost)
 *   ArrowLeft  step back to the previous prospect (undo a mis-key by
 *              re-deciding it, FR-010)
 *
 * Rules this file must keep (plan 002):
 * - ALL dynamic content set via textContent — never innerHTML (untrusted
 *   scraped/LLM text on a browser surface).
 * - Never advance past a prospect when a decision write failed (FR-013):
 *   on any non-2xx/network error, stay put and show the error.
 */
(function () {
  "use strict";

  var current = null; // the package on screen
  var history = []; // ids of previously shown packages (for ArrowLeft)
  var busy = false; // one in-flight decision at a time

  function $(id) {
    return document.getElementById(id);
  }

  function show(screen) {
    $("screen-empty").style.display = screen === "empty" ? "block" : "none";
    $("screen-done").style.display = screen === "done" ? "block" : "none";
    $("screen-review").style.display = screen === "review" ? "block" : "none";
  }

  function setError(message) {
    var el = $("error");
    if (message) {
      el.textContent = message;
      el.style.display = "block";
    } else {
      el.textContent = "";
      el.style.display = "none";
    }
  }

  function renderCounts(counts) {
    $("progress").textContent = counts.reviewed + " / " + counts.total;
  }

  function renderPackage(pkg) {
    current = pkg;
    $("company").textContent = pkg.company;
    $("contact").textContent = pkg.contact || "";

    var flag = $("flag");
    if (pkg.generatorFlag) {
      flag.textContent =
        "⚠ " + pkg.generatorFlag + " — generated fallback, check before approving";
      flag.style.display = "block";
    } else {
      flag.style.display = "none";
    }

    var badge = $("decision-badge");
    badge.className = "";
    if (pkg.decision === "approved" || pkg.decision === "rejected") {
      badge.textContent = "currently " + pkg.decision + " — A/R to change";
      badge.className = pkg.decision;
    } else {
      badge.textContent = "";
    }

    $("research").textContent = pkg.researchSummary || "(none)";
    $("pain").textContent = pkg.painPoint || "(none)";
    $("message-body").textContent = pkg.messageBody || "(no message — do not send)";
    var link = $("bfv-link");
    link.textContent = pkg.bfvLinkTelegram || "(none)";
    link.href = pkg.bfvLinkTelegram || "#";

    show("review");
  }

  function renderState(body) {
    renderCounts(body.counts);
    if (body.package) {
      renderPackage(body.package);
    } else if (body.counts.total === 0) {
      current = null;
      show("empty");
    } else {
      current = null;
      $("done-counts").textContent =
        body.counts.reviewed + " of " + body.counts.total + " prospects decided.";
      show("done");
    }
  }

  function loadNext() {
    return fetch("/review/packages/next")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (body) {
        setError(null);
        renderState(body);
      })
      .catch(function (err) {
        setError("Load failed: " + err.message);
      });
  }

  function decide(action) {
    if (!current || busy) return;
    busy = true;
    var decidedId = current.id;
    fetch("/review/packages/" + encodeURIComponent(decidedId) + "/decision", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: action }),
    })
      .then(function (res) {
        if (!res.ok) {
          // Surface the server's reason when it sent one (e.g. the Q006
          // not_send_ready refusal), not just the bare status code.
          return res
            .json()
            .catch(function () { return null; })
            .then(function (errBody) {
              var detail =
                errBody && errBody.error && errBody.error.message
                  ? errBody.error.message
                  : "HTTP " + res.status;
              throw new Error(detail);
            });
        }
        return res.json();
      })
      .then(function (body) {
        setError(null);
        history.push(decidedId);
        renderCounts(body.counts);
        if (body.next) {
          renderPackage(body.next);
        } else {
          current = null;
          $("done-counts").textContent =
            body.counts.reviewed + " of " + body.counts.total + " prospects decided.";
          show("done");
        }
      })
      .catch(function (err) {
        // FR-013: decision not recorded — do NOT advance.
        setError(action + " failed, not saved: " + err.message);
      })
      .finally(function () {
        busy = false;
      });
  }

  function goBack() {
    if (busy || history.length === 0) return;
    var id = history.pop();
    busy = true;
    fetch("/review/packages/" + encodeURIComponent(id))
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (body) {
        setError(null);
        renderCounts(body.counts);
        renderPackage(body.package);
      })
      .catch(function (err) {
        setError("Back failed: " + err.message);
      })
      .finally(function () {
        busy = false;
      });
  }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var key = e.key.toLowerCase();
    if (key === "a") decide("approve");
    else if (key === "r") decide("reject");
    else if (key === "n") decide("next");
    else if (e.key === "ArrowLeft") goBack();
    else return;
    e.preventDefault();
  });

  $("btn-approve").addEventListener("click", function () { decide("approve"); });
  $("btn-reject").addEventListener("click", function () { decide("reject"); });
  $("btn-next").addEventListener("click", function () { decide("next"); });
  $("btn-back").addEventListener("click", goBack);

  loadNext();
})();
