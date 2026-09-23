/* Ask this page — the reading assistant embedded in every standalone HTML
 * document under docs/.
 *
 * Two halves, and the first works with no network at all:
 *
 *   1. Local retrieval. The page indexes its own visible prose into passages
 *      and ranks them with BM25 in the browser. With no API key the panel is
 *      still a useful search over this document, with section links.
 *   2. Optional answering. If the reader supplies their own Claude API key, the
 *      retrieved passages and the question are sent to api.anthropic.com and
 *      the answer is streamed back.
 *
 * Raw fetch rather than the Anthropic SDK is deliberate: a standalone one-pager
 * must not load external JavaScript, so there is no bundler and no import. This
 * is the documented exception to using the SDK.
 *
 * Security boundary — restated in the panel itself, not only here:
 *   - No key is ever baked into this file, the builder, or any HTML page.
 *   - The reader's key lives in that browser's localStorage and is sent only to
 *     api.anthropic.com, only when they ask a question.
 *   - Because the call is made from the page, the page's JavaScript can read the
 *     key. The panel says so plainly. That is the cost of having no backend.
 *   - Only the retrieved passages, the question, and the last few turns are
 *     sent. The assistant is never widened from "this page" to the repository.
 *
 * Injected by docs/tools/doc-assistant/build.py. Never hand-edit the copy
 * inside an HTML page — change this file and rebuild every page.
 */
(function () {
  "use strict";

  var META = window.__DOC_ASSISTANT__ || { title: document.title, sections: [], siblings: [] };
  var KEY_STORE = "doc-assistant-api-key";

  // Claude API. claude-opus-5 is the current default model; effort "low" suits
  // grounded question-answering over passages that are already retrieved, and
  // keeps the reader's own bill small. max_tokens is deliberately modest —
  // these are short answers about one page, not long-form generation.
  var API_URL = "https://api.anthropic.com/v1/messages";
  var API_VERSION = "2023-06-01";
  var MODEL = "claude-opus-5";
  var MAX_TOKENS = 4096;
  var TOP_K = 6;          // passages sent to the model
  var HISTORY_TURNS = 4;  // prior turns kept for follow-ups

  // ---------------------------------------------------------------- indexing

  var STOP = (" a an and are as at be but by for from has have he her his i if in into is it its of on or " +
    "our she so that the their them then there these they this to was were what when which who will with you your ").split(/\s+/);
  var STOPSET = Object.create(null);
  STOP.forEach(function (w) { if (w) STOPSET[w] = 1; });

  function tokenize(text) {
    var raw = String(text).toLowerCase().match(/[a-z0-9_][a-z0-9_.-]*/g) || [];
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var t = raw[i].replace(/^[.-]+|[.-]+$/g, "");
      if (t && t.length > 1 && !STOPSET[t]) out.push(t);
    }
    return out;
  }

  var BLOCKS = "p, li, td, th, pre, blockquote, h1, h2, h3, h4";

  /* Index the page's own visible prose.
   *
   * Everything the builder generated is excluded, and so are scripts and
   * styles. If the assistant indexed its own output, its presence would change
   * the next build's metadata and the build would stop being idempotent. */
  function buildIndex() {
    var root = document.querySelector(".page") || document.body;
    var nodes = root.querySelectorAll(BLOCKS);
    var passages = [];

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.closest("#da-panel, #da-launch, script, style, nav")) continue;
      // Leaves only, so a <li> wrapping a <p> is not counted twice.
      if (el.querySelector(BLOCKS)) continue;

      var text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length < 24) continue;

      var section = el.closest("section[id]");
      var heading = "";
      var h = el.closest("section, article, div.panel, div.story");
      if (h) {
        var hEl = h.querySelector("h2, h3");
        if (hEl) heading = (hEl.innerText || "").replace(/\s+/g, " ").trim();
      }
      if (!heading && section) heading = section.id;

      passages.push({
        text: text,
        anchor: section ? section.id : "",
        heading: heading || META.title,
        tokens: tokenize(text)
      });
    }
    return passages;
  }

  /* Okapi BM25. k1 controls term-frequency saturation, b the length penalty;
   * these are the standard values and there is no tuning signal on one page. */
  function makeRanker(passages) {
    var K1 = 1.5, B = 0.75;
    var df = Object.create(null);
    var total = 0;

    passages.forEach(function (p) {
      total += p.tokens.length;
      var seen = Object.create(null);
      p.tokens.forEach(function (t) {
        if (!seen[t]) { seen[t] = 1; df[t] = (df[t] || 0) + 1; }
      });
      p.tf = Object.create(null);
      p.tokens.forEach(function (t) { p.tf[t] = (p.tf[t] || 0) + 1; });
    });

    var N = passages.length || 1;
    var avgLen = total / N || 1;

    return function rank(query) {
      var qTokens = tokenize(query);
      if (!qTokens.length) return [];
      var scored = passages.map(function (p) {
        var score = 0;
        for (var i = 0; i < qTokens.length; i++) {
          var t = qTokens[i];
          var f = p.tf[t];
          if (!f) continue;
          var n = df[t] || 0;
          var idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
          score += idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * (p.tokens.length / avgLen)));
        }
        return { p: p, score: score };
      });
      return scored
        .filter(function (s) { return s.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, TOP_K)
        .map(function (s) { return s.p; });
    };
  }

  // ------------------------------------------------------------------ storage

  function readKey() {
    try { return localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; }
  }
  function writeKey(value) {
    try {
      if (value) localStorage.setItem(KEY_STORE, value);
      else localStorage.removeItem(KEY_STORE);
    } catch (e) { /* private window, blocked site data */ }
  }

  // --------------------------------------------------------------------- UI

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var launch = el("button", null, "Ask this page");
  launch.id = "da-launch";
  launch.type = "button";
  launch.setAttribute("aria-haspopup", "dialog");

  var panel = el("div");
  panel.id = "da-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Ask this page");

  panel.innerHTML =
    '<div class="da-head">' +
      '<strong>Ask this page</strong>' +
      '<button class="da-icon" type="button" data-act="settings" aria-pressed="false" title="Settings">K</button>' +
      '<button class="da-icon" type="button" data-act="clear" title="Clear conversation">C</button>' +
      '<button class="da-icon" type="button" data-act="close" title="Close">X</button>' +
    '</div>' +
    '<div class="da-settings" hidden>' +
      '<label for="da-key">Your Claude API key</label>' +
      '<input id="da-key" type="password" placeholder="sk-ant-..." autocomplete="off" spellcheck="false">' +
      '<div class="da-row">' +
        '<button type="button" data-act="save">Save</button>' +
        '<button type="button" data-act="forget">Forget</button>' +
      '</div>' +
      '<p class="da-warn"><b>Read this before pasting a key.</b> The key is stored in ' +
      'this browser only and sent directly to api.anthropic.com when you ask a ' +
      'question. There is no server in between. Because the request is made by ' +
      'this page, <b>this page’s JavaScript can read your key</b> — only paste one ' +
      'you are willing to use that way, and prefer a scoped key you can revoke. ' +
      'Without a key the panel still works as search over this document.</p>' +
    '</div>' +
    '<div class="da-body"></div>' +
    '<div class="da-foot">' +
      '<form class="da-form">' +
        '<textarea rows="1" placeholder="Ask about this page…" aria-label="Your question"></textarea>' +
        '<button class="da-send" type="submit">Ask</button>' +
      '</form>' +
    '</div>';

  var body = panel.querySelector(".da-body");
  var settings = panel.querySelector(".da-settings");
  var keyInput = panel.querySelector("#da-key");
  var form = panel.querySelector(".da-form");
  var input = form.querySelector("textarea");
  var send = form.querySelector(".da-send");

  var passages = null;
  var rank = null;
  var history = [];
  var busy = false;

  function intro() {
    body.innerHTML = "";
    var p = el("p", "da-intro");
    p.innerHTML = "Searches <b>" + escapeHtml(META.title) + "</b> and answers from it. " +
      (readKey()
        ? "Answers are generated from the passages found on this page."
        : "No API key set, so this is passage search — still the fastest way to find a section. Add a key under <b>K</b> for written answers.");
    body.appendChild(p);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function addSources(turn, hits) {
    if (!hits.length) return;
    var wrap = el("div", "da-sources");
    wrap.appendChild(el("h4", null, hits.length + (hits.length === 1 ? " passage" : " passages") + " from this page"));
    hits.forEach(function (h) {
      var a = el("a", "da-src");
      a.href = h.anchor ? "#" + h.anchor : "#top";
      a.appendChild(el("b", null, h.heading));
      a.appendChild(el("span", null, h.text.slice(0, 190) + (h.text.length > 190 ? "…" : "")));
      a.addEventListener("click", function () { close(); });
      wrap.appendChild(a);
    });
    turn.appendChild(wrap);
  }

  function ask(question) {
    if (busy) return;
    if (!passages) { passages = buildIndex(); rank = makeRanker(passages); }

    var hits = rank(question);
    var turn = el("div", "da-turn");
    turn.appendChild(el("p", "da-q", question));
    body.appendChild(turn);

    if (!hits.length) {
      turn.appendChild(el("p", "da-note", "Nothing on this page matches that. Try the words the page itself uses — it only knows this document."));
      body.scrollTop = body.scrollHeight;
      return;
    }

    var key = readKey();
    if (!key) {
      addSources(turn, hits);
      turn.appendChild(el("p", "da-note", "Passage search only — add a Claude API key under K for a written answer."));
      body.scrollTop = body.scrollHeight;
      return;
    }

    var answer = el("div", "da-a", "");
    turn.appendChild(answer);
    addSources(turn, hits);
    body.scrollTop = body.scrollHeight;

    stream(key, question, hits, answer, turn);
  }

  function setBusy(state) {
    busy = state;
    send.disabled = state;
    send.textContent = state ? "…" : "Ask";
  }

  /* Send only what is needed: the retrieved passages, the question, and a short
   * tail of prior turns for follow-ups. Never the whole page, never other
   * pages, never the repository. */
  function stream(key, question, hits, answer, turn) {
    setBusy(true);

    var context = hits.map(function (h, i) {
      return "[" + (i + 1) + "] section: " + h.heading + (h.anchor ? " (#" + h.anchor + ")" : "") + "\n" + h.text;
    }).join("\n\n");

    var system =
      "You answer questions about one document: \"" + META.title + "\".\n" +
      "Answer only from the numbered passages provided. They are the whole of what you know here.\n" +
      "If the passages do not contain the answer, say so plainly and name the section a reader should open instead.\n" +
      "Cite the passages you used by their number, like [2].\n" +
      "Be brief and concrete. Prefer the document's own wording. Never invent a file path, a number, or a date that is not in the passages.\n" +
      "This document distinguishes what has been measured from what has only been tested or never run. Preserve that distinction exactly; never upgrade a claim.";

    var messages = history.slice(-HISTORY_TURNS * 2).concat([
      { role: "user", content: "Passages:\n\n" + context + "\n\nQuestion: " + question }
    ]);

    fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": API_VERSION,
        // Required for a browser to call the API directly. It is named
        // "dangerous" because it means the key is handled client-side.
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        output_config: { effort: "low" },
        system: system,
        messages: messages
      })
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          throw new Error("HTTP " + res.status + (t ? " — " + t.slice(0, 300) : ""));
        });
      }
      return readStream(res, answer);
    }).then(function (result) {
      if (result.refusal) {
        turn.appendChild(el("p", "da-note", "The model declined to answer that one."));
      }
      if (result.text) {
        history.push({ role: "user", content: question });
        history.push({ role: "assistant", content: result.text });
      }
      setBusy(false);
      body.scrollTop = body.scrollHeight;
    }).catch(function (err) {
      answer.remove();
      var e = el("div", "da-err", "Could not reach the Claude API. " + err.message);
      turn.appendChild(e);
      setBusy(false);
      body.scrollTop = body.scrollHeight;
    });
  }

  /* Server-sent events. Each frame is a blank-line-delimited block whose data:
   * line carries the JSON; text arrives as content_block_delta/text_delta. */
  function readStream(res, answer) {
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = "";
    var text = "";
    var refusal = false;

    function pump() {
      return reader.read().then(function (chunk) {
        if (chunk.done) return { text: text, refusal: refusal };
        buffer += decoder.decode(chunk.value, { stream: true });

        var frames = buffer.split("\n\n");
        buffer = frames.pop();

        frames.forEach(function (frame) {
          frame.split("\n").forEach(function (line) {
            if (line.indexOf("data:") !== 0) return;
            var payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") return;
            var evt;
            try { evt = JSON.parse(payload); } catch (e) { return; }

            if (evt.type === "content_block_delta" && evt.delta && evt.delta.type === "text_delta") {
              text += evt.delta.text;
              answer.textContent = text;
              body.scrollTop = body.scrollHeight;
            } else if (evt.type === "message_delta" && evt.delta && evt.delta.stop_reason === "refusal") {
              refusal = true;
            } else if (evt.type === "error") {
              throw new Error((evt.error && evt.error.message) || "stream error");
            }
          });
        });
        return pump();
      });
    }
    return pump();
  }

  // ------------------------------------------------------------------ wiring

  function open() {
    panel.hidden = false;
    launch.hidden = true;
    if (!body.childNodes.length) intro();
    input.focus();
  }
  function close() {
    panel.hidden = true;
    launch.hidden = false;
  }

  launch.addEventListener("click", open);

  panel.addEventListener("click", function (e) {
    var act = e.target.getAttribute && e.target.getAttribute("data-act");
    if (!act) return;
    if (act === "close") close();
    if (act === "clear") { history = []; intro(); }
    if (act === "settings") {
      var showing = settings.hidden;
      settings.hidden = !showing;
      e.target.setAttribute("aria-pressed", showing ? "true" : "false");
      if (showing) { keyInput.value = readKey(); keyInput.focus(); }
    }
    if (act === "save") {
      writeKey(keyInput.value.trim());
      settings.hidden = true;
      panel.querySelector('[data-act="settings"]').setAttribute("aria-pressed", "false");
      intro();
    }
    if (act === "forget") {
      writeKey("");
      keyInput.value = "";
      intro();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = "";
    input.style.height = "auto";
    ask(q);
  });

  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(120, input.scrollHeight) + "px";
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.dispatchEvent(new Event("submit")); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { close(); launch.focus(); }
  });

  document.body.appendChild(launch);
  document.body.appendChild(panel);
})();
