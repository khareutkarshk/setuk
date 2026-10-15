/*
  Proposal editor. Adds a toolbar on screen to edit the text in place, keep a draft in this
  browser, save the edited page back to HTML, and print it to PDF. It never touches the PDF
  layout: everything it adds is hidden in print and stripped from the saved HTML.
*/
(function () {
  "use strict";

  var PDF_NAME = "Setuk_DM_Letter_Tracking_Proposal";
  var DRAFT_KEY = "setuk-proposal-draft:" + location.pathname;
  var UI = "data-editor-ui";

  var pagesRoot = document.body;
  var baseHash, original;
  var editing = false;
  var saveTimer = null;

  /* ---------- helpers ---------- */

  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pages() { return $$("section.page"); }

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return String(h >>> 0);
  }

  // The pages as they would be saved: no editor attributes or classes.
  function pagesHTML() {
    return pages().map(function (p) { return cleanClone(p).outerHTML; }).join("\n\n");
  }

  function cleanClone(node) {
    var c = node.cloneNode(true);
    $$("[" + UI + "]", c).forEach(function (n) { n.remove(); });
    [c].concat($$("*", c)).forEach(function (n) {
      n.removeAttribute("contenteditable");
      n.removeAttribute("spellcheck");
      if (n.classList) n.classList.remove("is-overflowing");
      if (n.getAttribute && n.getAttribute("class") === "") n.removeAttribute("class");
    });
    return c;
  }

  function store(fn) { try { return fn(); } catch (e) { return null; } }

  var icon = {
    pen: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2.5l3 3L5 14H2v-3z"/></svg>',
    save: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h8l3 3v9H2V2z"/><path d="M5 2v4h5V2M5 14V9h6v5"/></svg>',
    down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v9M4 7l4 4 4-4M2.5 14h11"/></svg>'
  };

  /* ---------- toolbar ---------- */

  var bar = document.createElement("div");
  bar.className = "ed-bar";
  bar.setAttribute(UI, "");
  bar.innerHTML =
    '<div class="ed-title"><svg viewBox="0 0 949 405"><use href="#mark"/></svg><span data-title></span></div>' +
    '<div class="ed-status" data-status></div>' +
    '<button class="ed-btn" data-act="edit" aria-pressed="false">' + icon.pen + '<span>Edit text</span></button>' +
    '<button class="ed-btn quiet" data-act="reset" hidden>Discard changes</button>' +
    '<button class="ed-btn" data-act="save" title="Ctrl + S">' + icon.save + '<span>Save <span class="ed-label-long">HTML</span></span></button>' +
    '<button class="ed-btn primary" data-act="pdf">' + icon.down + '<span>Download PDF</span></button>';
  bar.querySelector("[data-title]").textContent = document.title;
  document.body.prepend(bar);

  var toast = document.createElement("div");
  toast.className = "ed-toast";
  toast.setAttribute(UI, "");
  document.body.appendChild(toast);
  var toastTimer;
  function say(msg, action, onAction, ms) {
    toast.innerHTML = "<span></span>";
    toast.firstChild.textContent = msg;
    if (action) {
      var b = document.createElement("button");
      b.textContent = action;
      b.onclick = function () { toast.classList.remove("show"); onAction(); };
      toast.appendChild(b);
    }
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, ms || 4500);
  }

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    ({ edit: toggleEdit, save: saveHTML, pdf: downloadPDF, reset: discard })[b.dataset.act]();
  });

  /* ---------- editing ---------- */

  function setEditable(on) {
    pages().forEach(function (p) {
      if (on) { p.setAttribute("contenteditable", "true"); p.setAttribute("spellcheck", "true"); }
      else { p.removeAttribute("contenteditable"); p.removeAttribute("spellcheck"); }
      // keep the drawings and page tools out of the editable flow
      $$("svg, .ed-pagetools", p).forEach(function (n) {
        if (on) n.setAttribute("contenteditable", "false"); else n.removeAttribute("contenteditable");
      });
    });
  }

  function toggleEdit() {
    editing = !editing;
    document.body.classList.toggle("is-editing", editing);
    bar.querySelector('[data-act="edit"]').setAttribute("aria-pressed", String(editing));
    bar.querySelector('[data-act="edit"] span').textContent = editing ? "Done editing" : "Edit text";
    setEditable(editing);
    if (editing) say("Click any text to change it. Ctrl + B for bold, Ctrl + Z to undo. Hover a page for page options.");
  }

  // Paste as plain text so outside styles never leak into the document.
  document.addEventListener("paste", function (e) {
    if (!editing || !e.target.closest || !e.target.closest(".page")) return;
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
  });

  document.addEventListener("input", function (e) {
    if (e.target.closest && e.target.closest(".page")) changed();
  });

  function changed() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { refresh(); keepDraft(); }, 400);
  }

  /* ---------- page tools ---------- */

  function addPageTools(p) {
    if (p.querySelector(".ed-pagetools")) return;
    var t = document.createElement("div");
    t.className = "ed-pagetools";
    t.setAttribute(UI, "");
    t.setAttribute("contenteditable", "false");
    t.innerHTML = '<button data-pt="add">+ Blank page after</button><button data-pt="dup">Duplicate</button><button data-pt="del" class="danger">Delete page</button>';
    p.appendChild(t);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-pt]");
    if (!b) return;
    var p = b.closest("section.page");
    if (b.dataset.pt === "del") {
      if (pages().length < 2 || !confirm("Delete this page?")) return;
      p.remove();
    } else if (b.dataset.pt === "dup") {
      p.after(cleanClone(p));
    } else {
      p.after(blankPage());
    }
    setup();
    changed();
  });

  function blankPage() {
    var ref = pages().filter(function (p) { return p.querySelector(".run-head"); })[0];
    var s = document.createElement("section");
    s.className = "page";
    s.innerHTML =
      (ref ? cleanClone(ref.querySelector(".run-head")).outerHTML : "") +
      '\n  <div class="kicker">Section</div>\n  <h2>New section</h2>\n  <p class="lede">Write here.</p>\n  ' +
      (ref ? cleanClone(ref.querySelector(".run-foot")).outerHTML : "");
    return s;
  }

  /* ---------- automatic layout fixes ---------- */

  // Page numbers: "02 / 11". The cover counts as page 1 and carries no footer.
  function numberPages() {
    var all = pages(), total = String(all.length).padStart(2, "0");
    all.forEach(function (p, i) {
      var pg = p.querySelector(".run-foot .pg");
      if (pg) pg.innerHTML = String(i + 1).padStart(2, "0") + " <span>/ " + total + "</span>";
    });
  }

  // Bar heights follow the values typed above them ("220 GB", "1.1 TB").
  function scaleBars() {
    $$(".bars").forEach(function (chart) {
      var bars = $$(".b", chart).map(function (b) {
        var m = (b.querySelector(".v") || {}).textContent || "";
        var n = parseFloat(m.replace(/,/g, "").replace(/[^\d.]/g, "")) || 0;
        if (/tb/i.test(m)) n *= 1000;
        if (/mb/i.test(m)) n /= 1000;
        return { el: b.querySelector(".fill"), n: n };
      });
      var max = Math.max.apply(null, bars.map(function (b) { return b.n; })) || 1;
      bars.forEach(function (b) { if (b.el) b.el.style.height = Math.max(2, (b.n / max) * 82).toFixed(1) + "%"; });
    });
  }

  // Flag any page whose content runs past its footer (or past the cover's bottom margin).
  function checkOverflow() {
    var bad = [];
    pages().forEach(function (p, i) {
      var foot = p.querySelector(".run-foot");
      var pr = p.getBoundingClientRect();
      var limit = foot ? foot.getBoundingClientRect().top - 2
        : pr.bottom - parseFloat(getComputedStyle(p).paddingBottom) + 2;
      var over = Array.prototype.some.call(p.children, function (c) {
        if (c === foot || c.classList.contains("run-head") || c.hasAttribute(UI)) return false;
        var pos = getComputedStyle(c).position;
        if (pos === "absolute" || pos === "fixed") return false;
        return c.getBoundingClientRect().bottom > limit;
      });
      p.classList.toggle("is-overflowing", over);
      if (over) bad.push(i + 1);
    });
    var st = bar.querySelector("[data-status]");
    if (bad.length) {
      st.textContent = (bad.length === 1 ? "Page " + bad[0] + " is" : "Pages " + bad.join(", ") + " are") + " too long";
      st.className = "ed-status warn";
      st.onclick = function () { pages()[bad[0] - 1].scrollIntoView({ behavior: "smooth", block: "center" }); };
    } else {
      st.textContent = pages().length + " pages · A4";
      st.className = "ed-status";
      st.onclick = null;
    }
    return bad;
  }

  function refresh() { numberPages(); scaleBars(); return checkOverflow(); }

  function setup() {
    pages().forEach(addPageTools);
    setEditable(editing);
    refresh();
  }

  /* ---------- draft kept in this browser ---------- */

  function keepDraft() {
    var html = pagesHTML();
    var dirty = hash(html) !== baseHash;
    store(function () {
      if (dirty) localStorage.setItem(DRAFT_KEY, JSON.stringify({ base: baseHash, html: html, at: Date.now() }));
      else localStorage.removeItem(DRAFT_KEY);
    });
    bar.querySelector('[data-act="reset"]').hidden = !dirty;
  }

  function replacePages(html) {
    var anchor = pages()[0];
    var holder = document.createElement("div");
    holder.innerHTML = html;
    var fresh = $$("section.page", holder);
    if (!fresh.length) return false;
    fresh.forEach(function (p) { anchor.before(p); });
    pages().slice(fresh.length).forEach(function (p) { p.remove(); });
    return true;
  }

  function restoreDraft() {
    var d = store(function () { return JSON.parse(localStorage.getItem(DRAFT_KEY)); });
    // Only restore a draft made from this exact version of the file; if the file was
    // changed by hand since, the file wins.
    if (!d || d.base !== baseHash || hash(d.html) === baseHash) return;
    if (replacePages(d.html)) {
      bar.querySelector('[data-act="reset"]').hidden = false;
      say("Your unsaved edits from last time are back.", "Discard them", discard, 7000);
    }
  }

  function discard() {
    if (!confirm("Discard all changes made in this browser and go back to the file as saved?")) return;
    store(function () { localStorage.removeItem(DRAFT_KEY); });
    replacePages(original);
    setup();
    bar.querySelector('[data-act="reset"]').hidden = true;
    say("Changes discarded.");
  }

  /* ---------- save HTML ---------- */

  function fullHTML() {
    refresh();
    var doc = cleanClone(document.documentElement);
    $$("body", doc).forEach(function (b) { b.classList.remove("is-editing"); if (!b.className) b.removeAttribute("class"); });
    return "<!doctype html>\n" + doc.outerHTML + "\n";
  }

  function saveHTML() {
    var html = fullHTML();
    var blob = new Blob([html], { type: "text/html" });
    var afterSave = function (where) {
      // The saved file now holds these edits, so the draft is no longer needed.
      baseHash = hash(pagesHTML());
      original = pagesHTML();
      store(function () { localStorage.removeItem(DRAFT_KEY); });
      bar.querySelector('[data-act="reset"]').hidden = true;
      say(where);
    };
    if (window.showSaveFilePicker) {
      window.showSaveFilePicker({ suggestedName: "index.html", types: [{ description: "HTML page", accept: { "text/html": [".html"] } }] })
        .then(function (h) { return h.createWritable().then(function (w) { return w.write(blob).then(function () { return w.close(); }); }).then(function () { return h.name; }); })
        .then(function (name) { afterSave("Saved to " + name + ". Keep it in this folder so the fonts and styles load."); })
        .catch(function (err) { if (err && err.name !== "AbortError") fallback(); });
    } else fallback();

    function fallback() {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "index.html";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      afterSave("index.html downloaded. Move it into this folder, replacing the old one.");
    }
  }

  /* ---------- PDF ---------- */

  function downloadPDF() {
    var bad = refresh();
    if (bad.length && !confirm((bad.length === 1 ? "Page " + bad[0] + " is" : "Pages " + bad.join(", ") + " are") +
      " too long and will be cut off in the PDF.\n\nDownload anyway?")) return;
    var title = document.title;
    var restore = function () { document.title = title; window.removeEventListener("afterprint", restore); };
    document.title = PDF_NAME; // becomes the suggested file name
    window.addEventListener("afterprint", restore);
    if (document.activeElement) document.activeElement.blur();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      say("In the print window, set Destination to “Save as PDF”, then Save.", null, null, 8000);
      setTimeout(function () { window.print(); setTimeout(restore, 1500); }, 60);
    });
  }

  window.addEventListener("beforeprint", refresh);

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveHTML(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") { e.preventDefault(); downloadPDF(); }
  });

  window.addEventListener("beforeunload", function () { if (editing) keepDraft(); });

  /* ---------- start ---------- */

  // Fill in page numbers and bar heights first, so the file's own state is the baseline
  // a draft is compared against.
  numberPages();
  scaleBars();
  baseHash = hash(pagesHTML());
  original = pagesHTML();
  restoreDraft();
  setup();
  if (document.fonts) document.fonts.ready.then(refresh);
  window.addEventListener("resize", checkOverflow);
})();
