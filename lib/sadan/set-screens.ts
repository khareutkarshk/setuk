/**
 * Canvas-drawn screens and badges for the table in the well, where the story's office scenes play:
 *   the problem    floating badges, a frozen spreadsheet, a flooded group chat, missed calls
 *   the solution   one Setuk inbox, a citizen SMS confirmation, the merged badge
 *   how we work    the consultant's laptop: setup, a training call, the month's numbers
 * Each function draws in logical pixels on a Screen from screens.ts and flags the texture for upload.
 * Everything shown is labelled sample data; names are illustrative.
 */
import type { Screen, Paint } from "./screens";
import { smooth } from "./progress";
import { GLYPH, type GlyphName } from "./glyphs";

export const LAPTOP = { w: 960, h: 600 };
export const PHONE = { w: 360, h: 740 };
export const BADGE = { w: 320, h: 330 };
export const TAG = { w: 560, h: 104 };

const paths = new Map<string, Path2D>();
function glyph(g: CanvasRenderingContext2D, name: GlyphName, x: number, y: number, size: number, color: string) {
  let p = paths.get(name);
  if (!p) { p = new Path2D(GLYPH[name]); paths.set(name, p); }
  g.save();
  g.translate(x, y);
  g.scale(size / 256, size / 256);
  g.fillStyle = color;
  g.fill(p);
  g.restore();
}

/* The Setuk bridge mark (viewBox 949 x 405), as in components/site/setuk-mark.tsx */
const MARK = {
  band: "M15 305 Q474 -15 934 305",
  deck: "M60 330 Q474 50 888 330 L868 348 L868 392 L811 392 L811 355 A85 85 0 0 0 641 355 L641 392 L590 392 L590 350 A115 115 0 0 0 360 350 L360 392 L307 392 L307 355 A85 85 0 0 0 137 355 L137 392 L80 392 L80 348 Z"
};
function mark(g: CanvasRenderingContext2D, x: number, y: number, w: number, arch: string, side = "#3fae6a", mid = "#5b9bff") {
  const k = w / 949;
  g.save();
  g.translate(x, y);
  g.scale(k, k);
  g.strokeStyle = arch; g.lineWidth = 34; g.stroke(new Path2D(MARK.band));
  g.fillStyle = arch; g.fill(new Path2D(MARK.deck));
  ([[225, 92, 38, side], [474, 56, 41, mid], [723, 92, 38, side]] as const).forEach(([cx, cy, r, c]) => { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); });
  g.restore();
}

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}
/** Sets the font, shrinking it until `text` fits in maxW */
function fit(g: CanvasRenderingContext2D, text: string, weight: number, size: number, f: string, maxW: number) {
  let s = size;
  g.font = `${weight} ${s}px ${f}`;
  while (s > 10 && g.measureText(text).width > maxW) { s -= 1; g.font = `${weight} ${s}px ${f}`; }
  return s;
}
function pill(g: CanvasRenderingContext2D, text: string, x: number, y: number, h: number, bg: string, fg: string, f: string, size = 18, align: "left" | "right" = "left") {
  g.font = `600 ${size}px ${f}`;
  const w = g.measureText(text).width + h * 0.9;
  const left = align === "left" ? x : x - w;
  g.fillStyle = bg; rr(g, left, y, w, h, h / 2); g.fill();
  g.fillStyle = fg; g.textBaseline = "middle"; g.fillText(text, left + h * 0.45, y + h / 2 + 1);
  return w;
}
const inr = (n: number) => Math.round(n).toLocaleString("en-IN");

/* ---------- badges (sprites) ---------- */

export interface BadgeLook { glyph: GlyphName; tint: string; tile?: string }

/** A floating badge: a white tile with the tool's icon and a caption under it */
export function drawBadge(s: Screen, p: Paint, look: BadgeLook, caption: string) {
  const g = s.g, f = p.font();
  g.clearRect(0, 0, BADGE.w, BADGE.h);
  g.save();
  g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 18; g.shadowOffsetY = 6;
  g.fillStyle = look.tile ?? "#fbfaf7"; rr(g, 54, 16, 212, 212, 46); g.fill();
  g.restore();
  glyph(g, look.glyph, 160 - 66, 122 - 66, 132, look.tint);
  g.textAlign = "center";
  const size = fit(g, caption, 600, 30, f, BADGE.w - 40);
  const w = g.measureText(caption).width + 34;
  g.fillStyle = "rgba(14,20,30,.86)"; rr(g, 160 - w / 2, 252, w, size + 26, (size + 26) / 2); g.fill();
  g.fillStyle = "#f4f6fa"; g.textBaseline = "middle"; g.fillText(caption, 160, 252 + (size + 26) / 2 + 1);
  g.textAlign = "left";
  s.tex.needsUpdate = true;
}

/** The merged badge: Setuk's mark on the accent, with a check */
export function drawSetukBadge(s: Screen, p: Paint, caption: string) {
  const g = s.g, f = p.font(), acc = p.accent(), ink = p.accentInk();
  g.clearRect(0, 0, BADGE.w, BADGE.h);
  g.save();
  g.shadowColor = "rgba(0,0,0,.4)"; g.shadowBlur = 22; g.shadowOffsetY = 6;
  g.fillStyle = acc; rr(g, 54, 16, 212, 212, 46); g.fill();
  g.restore();
  mark(g, 82, 78, 156, ink);
  glyph(g, "check", 214, 6, 62, "#2fbf71");
  g.textAlign = "center";
  const size = fit(g, caption, 700, 30, f, BADGE.w - 40);
  const w = g.measureText(caption).width + 34;
  g.fillStyle = "rgba(14,20,30,.88)"; rr(g, 160 - w / 2, 252, w, size + 26, (size + 26) / 2); g.fill();
  g.fillStyle = "#f4f6fa"; g.textBaseline = "middle"; g.fillText(caption, 160, 252 + (size + 26) / 2 + 1);
  g.textAlign = "left";
  s.tex.needsUpdate = true;
}

/** The mark alone, for the back of a laptop lid (256 x 256) */
export function drawLidMark(s: Screen, p: Paint) {
  const g = s.g;
  g.clearRect(0, 0, 256, 256);
  mark(g, 28, 74, 200, p.accent(), "#3fae6a", p.accent());
  s.tex.needsUpdate = true;
}

/** A pill tag. `kind` sets the colour and icon: "fail" red cross, "ok" green check, "label" plain */
export function drawTag(s: Screen, p: Paint, text: string, kind: "fail" | "ok" | "label") {
  const g = s.g, f = p.font();
  g.clearRect(0, 0, TAG.w, TAG.h);
  const bg = kind === "fail" ? "#d83a3a" : kind === "ok" ? "#1f9d5b" : "rgba(14,20,30,.86)";
  const ico = kind === "fail" ? "cross" : kind === "ok" ? "check" : null;
  const size = fit(g, text, 650, 38, f, TAG.w - (ico ? 130 : 70));
  const tw = g.measureText(text).width, w = tw + (ico ? 110 : 60), x = (TAG.w - w) / 2;
  g.fillStyle = bg; rr(g, x, 12, w, 80, 40); g.fill();
  if (ico) glyph(g, ico, x + 18, 25, 54, "#fff");
  g.fillStyle = "#fff"; g.textBaseline = "middle"; g.font = `650 ${size}px ${f}`;
  g.fillText(text, x + (ico ? 82 : 30), 53);
  s.tex.needsUpdate = true;
}

/* ---------- the office laptop ---------- */

/** A spreadsheet that has stopped responding, with a file-lock dialog. `t` turns the spinner. */
export function drawExcel(s: Screen, p: Paint, t: number) {
  const g = s.g, f = p.font(), x = p.labels.excel, rows = p.labels.chaos.rows, W = LAPTOP.w, H = LAPTOP.h;
  g.textBaseline = "middle";
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  /* title bar */
  g.fillStyle = "#f0f0f0"; g.fillRect(0, 0, W, 38);
  g.fillStyle = "#1e1e1e"; fit(g, `${x.file}  (${x.frozen})`, 500, 17, f, W - 160); g.fillText(`${x.file}  (${x.frozen})`, 16, 20);
  ["#bdbdbd", "#bdbdbd", "#e05050"].forEach((c, i) => { g.fillStyle = c; g.fillRect(W - 120 + i * 40, 12, 24, 14); });
  /* ribbon */
  g.fillStyle = "#1f7246"; g.fillRect(0, 38, W, 44);
  g.fillStyle = "#e9f5ee"; g.font = `500 16px ${f}`;
  ["File", "Home", "Insert", "Data", "View"].forEach((w, i) => g.fillText(w, 18 + i * 78, 61));
  /* formula bar */
  g.fillStyle = "#f7f7f7"; g.fillRect(0, 82, W, 34);
  g.fillStyle = "#666"; g.font = `italic 600 15px ${f}`; g.fillText("fx", 16, 99);
  g.fillStyle = "#222"; g.font = `500 15px ${f}`; g.fillText("=VLOOKUP(B4,Sheet2!A:F,3,FALSE)", 52, 99);
  /* grid */
  const cols = [44, 170, 80, 380, 230], top = 116, rh = 34;
  const cx = [0]; cols.forEach((w, i) => cx.push(cx[i] + w));
  g.fillStyle = "#efefef"; g.fillRect(0, top, W, rh);
  g.fillStyle = "#555"; g.font = `600 15px ${f}`;
  ["", ...x.cols].forEach((c, i) => { if (i) g.fillText(c, cx[i] + 10, top + rh / 2); });
  for (let r = 0; r < 13; r++) {
    const y = top + rh * (r + 1);
    g.fillStyle = "#f3f3f3"; g.fillRect(0, y, cols[0], rh);
    g.fillStyle = "#777"; g.font = `500 14px ${f}`; g.fillText(String(r + 2), 12, y + rh / 2);
    const name = x.names[r % x.names.length], req = rows[r % rows.length];
    const broken = r % 4 === 1, dup = r === 6 || r === 9, blank = r % 5 === 3;
    if (dup) { g.fillStyle = "#fff3b0"; g.fillRect(cols[0], y, W - cols[0], rh); }
    g.fillStyle = "#222"; g.font = `500 15px ${f}`;
    g.fillText(name, cx[1] + 10, y + rh / 2);
    g.fillText(blank ? "" : String(10 + ((r * 7) % 31)), cx[2] + 10, y + rh / 2);
    g.fillText(req, cx[3] + 10, y + rh / 2);
    if (broken) { g.fillStyle = "#fde2e2"; g.fillRect(cx[4], y, cols[4], rh); g.fillStyle = "#c62828"; g.font = `700 15px ${f}`; g.fillText(x.ref, cx[4] + 10, y + rh / 2); }
    else if (!blank) { g.fillStyle = "#999"; g.fillText("?", cx[4] + 10, y + rh / 2); }
  }
  g.strokeStyle = "#dadada"; g.lineWidth = 1;
  for (let r = 0; r <= 14; r++) { g.beginPath(); g.moveTo(0, top + rh * r + 0.5); g.lineTo(W, top + rh * r + 0.5); g.stroke(); }
  cx.forEach((c) => { g.beginPath(); g.moveTo(c + 0.5, top); g.lineTo(c + 0.5, H); g.stroke(); });
  /* "not responding" wash and the lock dialog */
  g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(0, 38, W, H - 38);
  const dw = 560, dh = 210, dx = (W - dw) / 2, dy = 220;
  g.save(); g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 30; g.fillStyle = "#fff"; rr(g, dx, dy, dw, dh, 10); g.fill(); g.restore();
  g.strokeStyle = "#c9c9c9"; rr(g, dx, dy, dw, dh, 10); g.stroke();
  glyph(g, "lock", dx + 26, dy + 30, 56, "#c62828");
  g.fillStyle = "#1e1e1e"; fit(g, x.locked, 600, 21, f, dw - 130); g.fillText(x.locked, dx + 100, dy + 50);
  g.fillStyle = "#555"; fit(g, x.file, 500, 17, f, dw - 130); g.fillText(x.file, dx + 100, dy + 84);
  /* spinner */
  g.strokeStyle = "#1f7246"; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.arc(dx + 54, dy + 150, 18, t * 5, t * 5 + 4.2); g.stroke(); g.lineCap = "butt";
  g.fillStyle = "#555"; g.font = `500 17px ${f}`; g.fillText(x.frozen + "…", dx + 88, dy + 151);
  s.tex.needsUpdate = true;
}

/** Setuk's inbox: the same requests, now each with a source, an owner and a status. `prog` slides rows in. */
export function drawInbox(s: Screen, p: Paint, prog: number) {
  const g = s.g, f = p.font(), acc = p.accent(), ink = p.accentInk(), b = p.labels.inbox, rows = p.labels.chaos.rows, W = LAPTOP.w;
  g.textBaseline = "middle";
  g.fillStyle = "#f6f7f9"; g.fillRect(0, 0, W, LAPTOP.h);
  g.fillStyle = acc; g.fillRect(0, 0, W, 64);
  mark(g, 22, 18, 56, ink);
  g.fillStyle = ink; g.font = `700 24px ${f}`; g.fillText(`Setuk  ·  ${b.title}`, 92, 33);
  g.font = `500 15px ${f}`; g.textAlign = "right"; g.fillText(p.labels.sample, W - 22, 33); g.textAlign = "left";
  const src: GlyphName[] = ["whatsapp", "register", "excel"];
  const srcTint = ["#1faa59", "#8a4b2d", "#1f7246"];
  const stTint: [string, string][] = [["#e7efff", "#1747a6"], ["#dff5e8", "#17793f"], ["#fff1d6", "#8a5a00"]];
  for (let i = 0; i < 6; i++) {
    const k = smooth(i * 0.08, 0.35 + i * 0.08, prog);
    if (k <= 0) continue;
    const y = 86 + i * 84 + (1 - k) * 18;
    g.globalAlpha = k;
    g.fillStyle = "#ffffff"; rr(g, 20, y, W - 40, 72, 14); g.fill();
    g.strokeStyle = "#e3e6ec"; g.lineWidth = 1; rr(g, 20, y, W - 40, 72, 14); g.stroke();
    g.fillStyle = "#eef1f5"; rr(g, 34, y + 14, 44, 44, 12); g.fill();
    glyph(g, src[i % 3], 42, y + 22, 28, srcTint[i % 3]);
    g.fillStyle = "#16202c"; fit(g, rows[i], 600, 19, f, 340); g.fillText(rows[i], 94, y + 26);
    g.fillStyle = "#6b7684"; g.font = `500 14px ${f}`; g.fillText(`${b.from[i % 3]}  ·  #${1036 + i}`, 94, y + 50);
    const owner = b.owners[i % 3];
    g.fillStyle = acc; g.beginPath(); g.arc(480, y + 36, 15, 0, 7); g.fill();
    g.fillStyle = ink; g.font = `700 14px ${f}`; g.textAlign = "center"; g.fillText(owner.slice(0, 1), 480, y + 37); g.textAlign = "left";
    g.fillStyle = "#16202c"; fit(g, owner, 500, 16, f, 200); g.fillText(owner, 504, y + 37);
    const [bg, fg] = stTint[i % 3];
    pill(g, b.status[i % 3], W - 36, y + 20, 32, bg, fg, f, 15, "right");
    g.globalAlpha = 1;
  }
  s.tex.needsUpdate = true;
}

/* ---------- phones ---------- */

function statusBar(g: CanvasRenderingContext2D, f: string, fg: string, lowBattery: boolean) {
  g.fillStyle = fg; g.font = `600 17px ${f}`; g.textBaseline = "middle"; g.fillText("10:42", 26, 22);
  g.strokeStyle = fg; g.lineWidth = 2; rr(g, PHONE.w - 58, 13, 32, 17, 4); g.stroke();
  g.fillStyle = lowBattery ? "#e5484d" : fg; rr(g, PHONE.w - 55, 16, lowBattery ? 5 : 22, 11, 2); g.fill();
}

/** A group chat flooding with messages. `n` is how many have arrived; the newest is at the bottom. */
export function drawChat(s: Screen, p: Paint, n: number) {
  const g = s.g, f = p.font(), w = p.labels.wa, W = PHONE.w, H = PHONE.h;
  g.textBaseline = "middle";
  g.fillStyle = "#efeae2"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#008069"; g.fillRect(0, 0, W, 112);
  statusBar(g, f, "#fff", true);
  g.fillStyle = "#cfe9e3"; g.beginPath(); g.arc(46, 76, 22, 0, 7); g.fill();
  glyph(g, "users", 32, 62, 28, "#008069");
  g.fillStyle = "#fff"; fit(g, w.group, 600, 20, f, W - 100); g.fillText(w.group, 80, 68);
  g.fillStyle = "#d4efe9"; g.font = `500 14px ${f}`; g.fillText(w.members, 80, 92);
  const senders = ["#d6457d", "#2e7d32", "#1565c0", "#ef6c00", "#6a1b9a"];
  for (let k = 0; k < 7; k++) {
    const idx = n - k, y = 640 - k * 76;
    if (idx < 0 || y < 120) break;
    const msg = w.msgs[idx % w.msgs.length];
    g.font = `500 16px ${f}`;
    const tw = Math.min(W - 110, Math.max(140, g.measureText(msg).width + 30));
    g.fillStyle = "#ffffff"; rr(g, 14, y, tw, 64, 12); g.fill();
    g.fillStyle = senders[idx % senders.length]; g.font = `600 13px ${f}`; g.fillText(`+91 9${(idx * 7919) % 10}${(idx * 31) % 10}xx xxx${(idx * 13) % 10}${(idx * 3) % 10}`, 26, y + 18);
    g.fillStyle = "#111"; fit(g, msg, 500, 16, f, tw - 26); g.fillText(msg, 26, y + 42);
  }
  /* unread pill */
  g.fillStyle = "#25d366"; rr(g, W - 112, 128, 92, 34, 17); g.fill();
  g.fillStyle = "#fff"; g.font = `700 17px ${f}`; g.textAlign = "center"; g.fillText(w.unread, W - 66, 146); g.textAlign = "left";
  g.fillStyle = "#f0f2f5"; g.fillRect(0, H - 64, W, 64);
  g.fillStyle = "#fff"; rr(g, 12, H - 52, W - 80, 40, 20); g.fill();
  g.fillStyle = "#008069"; g.beginPath(); g.arc(W - 34, H - 32, 20, 0, 7); g.fill();
  s.tex.needsUpdate = true;
}

/** A lock screen piling up missed calls and unread messages */
export function drawMissed(s: Screen, p: Paint, n: number) {
  const g = s.g, f = p.font(), w = p.labels.wa, W = PHONE.w, H = PHONE.h;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1b2433"); gr.addColorStop(1, "#0b0f16");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  statusBar(g, f, "#e8edf5", true);
  g.fillStyle = "#e8edf5"; g.font = `300 86px ${f}`; g.textAlign = "center"; g.fillText("10:42", W / 2, 150); g.textAlign = "left";
  const cards: [GlyphName, string, string, string][] = [
    ["hang", w.missed, String(Number(w.calls) + (n % 4)), "#e5484d"],
    ["whatsapp", w.group, w.unread, "#25d366"],
    ["battery", "4%", "", "#f5a524"]
  ];
  cards.forEach(([ico, title, count, c], i) => {
    const y = 250 + i * 108;
    g.fillStyle = "rgba(255,255,255,.12)"; rr(g, 18, y, W - 36, 92, 20); g.fill();
    g.fillStyle = c; rr(g, 34, y + 22, 48, 48, 12); g.fill();
    glyph(g, ico, 42, y + 30, 32, "#fff");
    g.fillStyle = "#f2f5fa"; fit(g, title, 600, 19, f, 170); g.fillText(title, 98, y + 46);
    if (count) { g.font = `700 22px ${f}`; g.fillStyle = c; g.textAlign = "right"; g.fillText(count, W - 36, y + 46); g.textAlign = "left"; }
  });
  s.tex.needsUpdate = true;
}

/** The citizen-side confirmation once a request is logged in Setuk */
export function drawPhoneOk(s: Screen, p: Paint) {
  const g = s.g, f = p.font(), b = p.labels.inbox, acc = p.accent(), ink = p.accentInk(), W = PHONE.w, H = PHONE.h;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1b2433"); gr.addColorStop(1, "#0b0f16");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  statusBar(g, f, "#e8edf5", false);
  g.fillStyle = "#e8edf5"; g.font = `300 86px ${f}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("10:44", W / 2, 150); g.textAlign = "left";
  [[b.logged, "check"], [b.sms, "sms"]].forEach(([text, ico], i) => {
    const y = 250 + i * 108;
    g.fillStyle = "rgba(255,255,255,.9)"; rr(g, 18, y, W - 36, 92, 20); g.fill();
    g.fillStyle = acc; rr(g, 34, y + 22, 48, 48, 12); g.fill();
    if (i === 0) mark(g, 38, y + 34, 40, ink); else glyph(g, ico as GlyphName, 42, y + 30, 32, ink);
    g.fillStyle = "#121a26"; fit(g, text, 600, 19, f, W - 150); g.fillText(text, 98, y + 46);
  });
  s.tex.needsUpdate = true;
}

/* ---------- the consultant's laptop ---------- */

function appFrame(g: CanvasRenderingContext2D, p: Paint, title: string) {
  const f = p.font(), acc = p.accent(), ink = p.accentInk(), W = LAPTOP.w, H = LAPTOP.h;
  g.textBaseline = "middle";
  g.fillStyle = "#f6f7f9"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#0f1a2b"; g.fillRect(0, 0, 76, H);
  g.fillStyle = acc; rr(g, 14, 16, 48, 48, 12); g.fill();
  mark(g, 18, 31, 40, ink);
  (["users", "lock", "register", "chat", "up"] as GlyphName[]).forEach((n, i) => glyph(g, n, 24, 96 + i * 62, 28, i === 0 ? "#ffffff" : "#6f7d92"));
  g.fillStyle = "#121a26"; fit(g, title, 700, 26, f, 520); g.fillText(title, 100, 42);
  g.fillStyle = "#7a8594"; g.font = `500 14px ${f}`; g.textAlign = "right"; g.fillText(p.labels.sample, W - 24, 42); g.textAlign = "left";
}

/** Step 2: roles, a permission matrix that fills in, record import and SOPs. `prog` 0..1 over the step. */
export function drawSetup(s: Screen, p: Paint, prog: number) {
  const g = s.g, f = p.font(), acc = p.accent(), u = p.labels.setup, W = LAPTOP.w;
  appFrame(g, p, u.title);
  /* roles */
  g.fillStyle = "#fff"; rr(g, 96, 78, 300, 300, 16); g.fill();
  g.fillStyle = "#6b7684"; g.font = `600 14px ${f}`; g.fillText(u.roles.toUpperCase(), 116, 104);
  u.roleNames.forEach((r, i) => {
    const y = 126 + i * 62, on = prog > 0.08 + i * 0.1;
    g.fillStyle = on ? "#eef3ff" : "#f3f4f6"; rr(g, 110, y, 272, 50, 12); g.fill();
    g.fillStyle = on ? acc : "#c5ccd6"; g.beginPath(); g.arc(136, y + 25, 14, 0, 7); g.fill();
    g.fillStyle = "#16202c"; fit(g, r, 600, 17, f, 190); g.fillText(r, 160, y + 26);
    if (on) glyph(g, "check", 346, y + 13, 24, "#1f9d5b");
  });
  /* who sees what */
  g.fillStyle = "#fff"; rr(g, 412, 78, 524, 300, 16); g.fill();
  g.fillStyle = "#6b7684"; g.font = `600 14px ${f}`; g.fillText(u.access.toUpperCase(), 432, 104);
  u.perms.forEach((c, j) => { g.fillStyle = "#6b7684"; fit(g, c, 600, 14, f, 90); g.textAlign = "center"; g.fillText(c, 612 + j * 92, 134); g.textAlign = "left"; });
  u.roleNames.forEach((r, i) => {
    const y = 162 + i * 52;
    g.fillStyle = "#16202c"; fit(g, r, 500, 15, f, 140); g.fillText(r, 432, y);
    u.perms.forEach((_, j) => {
      const allowed = (i === 0) || (i === 1 && j < 3) || (i === 2 && j < 2) || (i === 3 && j === 3) || (i === 3 && j === 1);
      const k = smooth(0.15 + (i * 4 + j) * 0.025, 0.2 + (i * 4 + j) * 0.025, prog);
      const x = 592 + j * 92;
      g.fillStyle = allowed && k > 0.5 ? acc : "#dfe3ea"; rr(g, x, y - 12, 40, 24, 12); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(x + (allowed ? 12 + 16 * k : 12), y, 9, 0, 7); g.fill();
    });
  });
  /* import */
  const total = 18000, done = total * smooth(0.3, 0.95, prog);
  g.fillStyle = "#fff"; rr(g, 96, 394, 520, 186, 16); g.fill();
  g.fillStyle = "#6b7684"; g.font = `600 14px ${f}`; g.fillText(u.importing.toUpperCase(), 116, 420);
  g.fillStyle = "#121a26"; g.font = `700 44px ${f}`; g.fillText(inr(done), 116, 474);
  const dw = g.measureText(inr(done)).width;
  g.fillStyle = "#7a8594"; g.font = `500 20px ${f}`; g.fillText(`/ ${inr(total)}`, 126 + dw, 480);
  g.fillStyle = "#e6e9ef"; rr(g, 116, 516, 480, 14, 7); g.fill();
  g.fillStyle = acc; rr(g, 116, 516, Math.max(14, 480 * (done / total)), 14, 7); g.fill();
  (["register", "excel", "whatsapp"] as GlyphName[]).forEach((n, i) => glyph(g, n, 116 + i * 40, 542, 26, ["#8a4b2d", "#1f7246", "#1faa59"][i]));
  /* SOPs */
  g.fillStyle = "#fff"; rr(g, 632, 394, 304, 186, 16); g.fill();
  g.fillStyle = "#6b7684"; g.font = `600 14px ${f}`; g.fillText(u.sops.toUpperCase(), 652, 420);
  u.sopNames.forEach((n, i) => {
    const y = 440 + i * 44, on = prog > 0.55 + i * 0.12;
    g.fillStyle = on ? "#dff5e8" : "#f3f4f6"; rr(g, 648, y, 272, 36, 10); g.fill();
    glyph(g, on ? "check" : "register", 658, y + 6, 24, on ? "#1f9d5b" : "#9aa3b0");
    g.fillStyle = "#16202c"; fit(g, n, 500, 15, f, 210); g.fillText(n, 692, y + 19);
  });
  void W;
  s.tex.needsUpdate = true;
}

/** Step 3: a role-by-role training call. `t` drives the speaker ring and the highlighted step. */
export function drawMeet(s: Screen, p: Paint, t: number) {
  const g = s.g, f = p.font(), acc = p.accent(), ink = p.accentInk(), m = p.labels.meet, W = LAPTOP.w, H = LAPTOP.h;
  g.textBaseline = "middle";
  g.fillStyle = "#202124"; g.fillRect(0, 0, W, H);
  /* shared screen: the lesson */
  g.fillStyle = "#f6f7f9"; rr(g, 16, 16, 676, 486, 12); g.fill();
  g.fillStyle = acc; rr(g, 16, 16, 676, 56, [12, 12, 0, 0]); g.fill();
  mark(g, 32, 30, 48, ink);
  g.fillStyle = ink; fit(g, m.topic, 700, 22, f, 560); g.fillText(m.topic, 94, 45);
  const step = Math.floor(t / 1.6) % m.steps.length;
  m.steps.forEach((st, i) => {
    const y = 100 + i * 96, on = i === step, done = i < step;
    g.fillStyle = on ? "#eef3ff" : "#ffffff"; rr(g, 40, y, 628, 78, 14); g.fill();
    if (on) { g.strokeStyle = acc; g.lineWidth = 3; rr(g, 40, y, 628, 78, 14); g.stroke(); }
    g.fillStyle = done ? "#1f9d5b" : on ? acc : "#dfe3ea"; g.beginPath(); g.arc(80, y + 39, 20, 0, 7); g.fill();
    g.fillStyle = done || on ? "#fff" : "#6b7684"; g.font = `700 18px ${f}`; g.textAlign = "center"; g.fillText(done ? "✓" : String(i + 1), 80, y + 40); g.textAlign = "left";
    g.fillStyle = "#16202c"; fit(g, st, on ? 700 : 500, 22, f, 520); g.fillText(st, 118, y + 40);
  });
  /* participants */
  const names = [m.trainer, ...m.roles.slice(0, 3)];
  const speaking = Math.floor(t / 2.4) % 2 === 0 ? 0 : 1 + (Math.floor(t / 4.8) % 3);
  names.forEach((n, i) => {
    const y = 16 + i * 122;
    g.fillStyle = "#3c4043"; rr(g, 708, y, 236, 110, 10); g.fill();
    const c = ["#5b8def", "#e8710a", "#12a4af", "#a142f4"][i];
    g.fillStyle = c; g.beginPath(); g.arc(826, y + 46, 28, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.font = `700 24px ${f}`; g.textAlign = "center"; g.fillText(n.slice(0, 1), 826, y + 47); g.textAlign = "left";
    if (i === speaking) { g.strokeStyle = "#8ab4f8"; g.lineWidth = 3 + 2 * Math.abs(Math.sin(t * 7)); g.beginPath(); g.arc(826, y + 46, 34, 0, 7); g.stroke(); }
    g.fillStyle = "#e8eaed"; fit(g, n, 500, 14, f, 210); g.fillText(n, 718, y + 96);
  });
  /* controls */
  g.fillStyle = "#e8eaed"; fit(g, m.title, 500, 16, f, 300); g.fillText(m.title, 24, H - 48);
  g.fillStyle = "#ea4335"; g.beginPath(); g.arc(30 + g.measureText(m.title).width + 12, H - 48, 5, 0, 7); g.fill();
  const bx = W / 2 - 132;
  (["mic", "cam", "screen", "hang"] as GlyphName[]).forEach((n, i) => {
    const x = bx + i * 66, hang = n === "hang";
    g.fillStyle = hang ? "#ea4335" : i === 2 ? "#8ab4f8" : "#3c4043";
    if (hang) { rr(g, x - 6, H - 72, 64, 48, 24); g.fill(); } else { g.beginPath(); g.arc(x + 24, H - 48, 24, 0, 7); g.fill(); }
    glyph(g, n, x + 10, H - 62, 28, i === 2 ? "#202124" : "#fff");
  });
  s.tex.needsUpdate = true;
}

const WEEKS = [182, 214, 251, 296];
/** Step 4: the month's numbers counting up, and handled-per-week bars. `prog` 0..1. */
export function drawRun(s: Screen, p: Paint, prog: number) {
  const g = s.g, f = p.font(), acc = p.accent(), r = p.labels.run;
  appFrame(g, p, r.title);
  const vals = [943, 412, 2860], up = ["+18%", "+24%", "+31%"];
  r.tiles.forEach((label, i) => {
    const x = 96 + i * 284, e = smooth(i * 0.1, 0.7 + i * 0.1, prog);
    g.fillStyle = "#fff"; rr(g, x, 78, 268, 178, 16); g.fill();
    g.fillStyle = "#6b7684"; fit(g, label, 600, 16, f, 230); g.fillText(label, x + 20, 108);
    g.fillStyle = "#121a26"; g.font = `700 60px ${f}`; g.fillText(inr(vals[i] * e), x + 20, 170);
    if (e > 0.6) {
      g.globalAlpha = smooth(0.6, 1, e);
      g.fillStyle = "#dff5e8"; rr(g, x + 20, 206, 90, 30, 15); g.fill();
      glyph(g, "up", x + 28, 210, 22, "#17793f");
      g.fillStyle = "#17793f"; g.font = `700 15px ${f}`; g.fillText(up[i], x + 54, 222);
      g.fillStyle = "#7a8594"; fit(g, r.vs, 500, 14, f, 130); g.fillText(r.vs, x + 120, 222);
      g.globalAlpha = 1;
    }
  });
  g.fillStyle = "#fff"; rr(g, 96, 272, 836, 308, 16); g.fill();
  g.fillStyle = "#6b7684"; g.font = `600 14px ${f}`; g.fillText(r.trend.toUpperCase(), 118, 300);
  const max = 320, base = 548;
  WEEKS.forEach((v, i) => {
    const e = smooth(0.15 + i * 0.12, 0.55 + i * 0.12, prog), h = (v / max) * 210 * e, x = 150 + i * 196;
    g.fillStyle = i === 3 ? acc : "#c9d6f0"; rr(g, x, base - h, 120, h, 10); g.fill();
    if (e > 0.2) { g.fillStyle = "#121a26"; g.font = `700 20px ${f}`; g.textAlign = "center"; g.fillText(inr(v * e), x + 60, base - h - 18); g.textAlign = "left"; }
  });
  s.tex.needsUpdate = true;
}

/** A sheet of paper: a typed or handwritten letter, for the register props and loose papers */
export function drawPaper(g: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  g.fillStyle = "#f4efe3"; g.fillRect(0, 0, w, h);
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = "rgba(40,40,60,.55)";
  g.fillRect(w * 0.1, h * 0.07, w * 0.35, h * 0.018);
  for (let y = h * 0.16; y < h * 0.9; y += h * 0.034) {
    const len = w * (0.55 + rnd() * 0.3);
    g.fillStyle = `rgba(30,40,80,${0.25 + rnd() * 0.2})`;
    g.fillRect(w * 0.1, y, len, h * 0.007);
  }
  g.strokeStyle = "rgba(200,60,60,.5)"; g.lineWidth = w * 0.006;
  g.beginPath(); g.moveTo(w * 0.07, 0); g.lineTo(w * 0.07, h); g.stroke();
}
