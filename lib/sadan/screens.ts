/**
 * Canvas-drawn screens in the chamber. Each screen draws in logical pixels and is scaled to the
 * tier's resolution. They are redrawn only when their state changes.
 *   left wall   "the old way" inbox, later the monthly report
 *   right wall  the Setuk dashboard
 *   desk        the hero seat's tablet, alternating Office and Election products
 * All figures are labelled sample data.
 */
import * as THREE from "three";
import type { SceneLabels } from "@/content/types";
import { smooth } from "./progress";

export interface Screen {
  canvas: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
}

export function createScreen(w: number, h: number, scale: number, anisotropy: number): Screen {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const g = canvas.getContext("2d")!;
  g.scale(scale, scale);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return { canvas, g, tex };
}

export interface Paint {
  font: () => string;
  accent: () => string;
  /** Text colour on the accent */
  accentInk: () => string;
  labels: SceneLabels;
}

export const WALL = { w: 1280, h: 720 };
export const DESK = { w: 800, h: 520 };

const SAMPLE = { booths: 1742, boothsOf: 1930, letters: 86, appts: 214, types: [312, 268, 190, 141, 97] };
const REPORT = { handled: [92, 104, 118, 98], pending: [14, 11, 8, 6] };
const inr = (n: number) => n.toLocaleString("en-IN");

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

function header(g: CanvasRenderingContext2D, f: string, title: string, sample: string, mark: string, bar = "#121b26", bg = "#0b1119") {
  g.fillStyle = bg; g.fillRect(0, 0, WALL.w, WALL.h);
  g.fillStyle = bar; g.fillRect(0, 0, WALL.w, 84);
  g.fillStyle = mark; rr(g, 40, 26, 32, 32, 9); g.fill();
  g.fillStyle = "#e8eef5"; g.font = `600 30px ${f}`; g.textBaseline = "middle";
  g.fillText(title, 88, 43);
  if (sample) {
    g.font = `500 20px ${f}`; g.fillStyle = "#8ea0b4"; g.textAlign = "right"; g.fillText(sample, WALL.w - 40, 43); g.textAlign = "left";
  }
}

/** Right wall: the dashboard, counting up as the House lights */
export function drawDashboard(s: Screen, p: Paint, prog: number) {
  const g = s.g, f = p.font(), acc = p.accent(), L = p.labels;
  header(g, f, `Setuk  ·  ${L.dashboard.title}`, L.sample, acc);
  const tiles: [string, string, string][] = [
    [L.dashboard.booths, inr(Math.round(SAMPLE.booths * prog)), `/ ${inr(SAMPLE.boothsOf)}`],
    [L.dashboard.letters, Math.round(SAMPLE.letters * prog) + "%", ""],
    [L.dashboard.appts, String(Math.round(SAMPLE.appts * prog)), ""]
  ];
  tiles.forEach(([label, v, sub], i) => {
    const y = 120 + i * 190;
    g.fillStyle = "#121b26"; rr(g, 40, y, 470, 168, 22); g.fill();
    g.fillStyle = "#8ea0b4"; g.font = `500 22px ${f}`; g.fillText(label, 68, y + 40);
    g.fillStyle = "#f3f6fa"; g.font = `700 64px ${f}`; g.fillText(v, 68, y + 106);
    if (sub) { const w = g.measureText(v).width; g.fillStyle = "#8ea0b4"; g.font = `500 26px ${f}`; g.fillText(sub, 80 + w, y + 112); }
    const pct = i === 0 ? SAMPLE.booths / SAMPLE.boothsOf : i === 1 ? SAMPLE.letters / 100 : 0.7;
    g.fillStyle = "#1e2a38"; rr(g, 68, y + 140, 414, 8, 4); g.fill();
    g.fillStyle = acc; rr(g, 68, y + 140, Math.max(8, 414 * pct * prog), 8, 4); g.fill();
  });
  g.fillStyle = "#121b26"; rr(g, 540, 120, 700, 548, 22); g.fill();
  g.fillStyle = "#8ea0b4"; g.font = `500 22px ${f}`; g.fillText(L.dashboard.byType, 572, 160);
  const max = Math.max(...SAMPLE.types);
  L.dashboard.types.forEach((t, i) => {
    const y = 210 + i * 90, w = 400 * (SAMPLE.types[i] / max) * smooth(i * 0.1, 0.6 + i * 0.1, prog);
    g.fillStyle = "#c6d2de"; g.font = `500 24px ${f}`; g.fillText(t, 572, y + 22);
    g.fillStyle = "#1e2a38"; rr(g, 572, y + 42, 520, 22, 11); g.fill();
    g.fillStyle = acc; g.globalAlpha = 1 - i * 0.12; rr(g, 572, y + 42, Math.max(22, w * 1.3), 22, 11); g.fill(); g.globalAlpha = 1;
    g.fillStyle = "#f3f6fa"; g.font = `600 24px ${f}`; g.textAlign = "right"; g.fillText(String(Math.round(SAMPLE.types[i] * prog)), 1208, y + 22); g.textAlign = "left";
  });
  s.tex.needsUpdate = true;
}

/** Left wall, "the old way": requests with no owner and no status, appearing one by one */
export function drawChaos(s: Screen, p: Paint, prog: number) {
  const g = s.g, f = p.font(), ch = p.labels.chaos;
  header(g, f, ch.title, "", "#e5484d", "#2a1712", "#14100e");
  g.font = `600 30px ${f}`;
  const tw = g.measureText(ch.title).width;
  g.font = `600 18px ${f}`;
  const sw = g.measureText(ch.sub).width;
  g.fillStyle = "#e5484d"; rr(g, 104 + tw, 26, sw + 40, 32, 16); g.fill();
  g.fillStyle = "#fff"; g.fillText(ch.sub, 124 + tw, 43);
  ([[ch.pending, "?"], [ch.owner, ch.unknown]] as const).forEach(([l, v], i) => {
    const y = 120 + i * 200;
    g.fillStyle = "#211915"; rr(g, 40, y, 360, 176, 22); g.fill();
    g.fillStyle = "#b19c92"; g.font = `500 22px ${f}`; g.fillText(l, 68, y + 42);
    g.fillStyle = "#f4a29a"; g.font = `700 ${i ? 46 : 84}px ${f}`; g.fillText(v, 68, y + 112);
  });
  g.fillStyle = "#211915"; rr(g, 40, 520, 360, 148, 22); g.fill();
  for (let k = 0; k < 9; k++) {
    g.fillStyle = `rgba(244,162,154,${0.18 + (k % 3) * 0.12})`;
    rr(g, 68 + k * 34, 600 - (k % 4) * 16, 24, 40 + (k % 4) * 16, 6); g.fill();
  }
  ch.rows.forEach((t, i) => {
    const show = smooth(i * 0.11, i * 0.11 + 0.3, prog);
    if (show <= 0) return;
    const y = 120 + i * 92;
    g.globalAlpha = show;
    g.fillStyle = "#1d1613"; rr(g, 430, y, 810, 76, 18); g.fill();
    g.fillStyle = "#e9ddd7"; g.font = `500 24px ${f}`; g.fillText(t, 458, y + 38);
    const red = i % 3 !== 2, label = ch.status[i];
    g.font = `600 19px ${f}`;
    const lw = g.measureText(label).width + 36;
    g.fillStyle = red ? "rgba(229,72,77,.18)" : "rgba(245,166,35,.18)"; rr(g, 1212 - lw, y + 20, lw, 36, 18); g.fill();
    g.fillStyle = red ? "#ff8a8e" : "#f5b44a"; g.textAlign = "right"; g.fillText(label, 1194, y + 38); g.textAlign = "left";
    g.globalAlpha = 1;
  });
  s.tex.needsUpdate = true;
}

/** Left wall in the "Run" chapter: the monthly report and the quarterly review */
export function drawReport(s: Screen, p: Paint, prog: number) {
  const g = s.g, f = p.font(), acc = p.accent(), rp = p.labels.report;
  header(g, f, `Setuk  ·  ${rp.title}`, p.labels.sample, acc);
  const handled = REPORT.handled.reduce((a, b) => a + b, 0);
  ([[rp.handled, handled, acc], [rp.pending, REPORT.pending[3], "#8ea0b4"]] as const).forEach(([l, v, c], i) => {
    const y = 120 + i * 190;
    g.fillStyle = "#121b26"; rr(g, 40, y, 360, 168, 22); g.fill();
    g.fillStyle = "#8ea0b4"; g.font = `500 22px ${f}`; g.fillText(l, 68, y + 40);
    g.fillStyle = c; g.font = `700 72px ${f}`; g.fillText(String(Math.round(v * prog)), 68, y + 108);
  });
  g.fillStyle = "#121b26"; rr(g, 40, 500, 360, 168, 22); g.fill();
  g.fillStyle = "#8ea0b4"; g.font = `500 22px ${f}`; g.fillText(rp.quarter, 68, 540);
  rp.quarters.forEach((q, i) => {
    const x = 92 + i * 80, on = prog > 0.3 + i * 0.15;
    g.fillStyle = on ? acc : "#1e2a38"; g.beginPath(); g.arc(x, 610, 24, 0, 7); g.fill();
    g.fillStyle = on ? "#0b1119" : "#8ea0b4"; g.font = `700 18px ${f}`; g.textAlign = "center"; g.fillText(q, x, 611); g.textAlign = "left";
  });
  g.fillStyle = "#121b26"; rr(g, 430, 120, 810, 548, 22); g.fill();
  const max = 130;
  REPORT.handled.forEach((h, i) => {
    const x = 500 + i * 180, base = 600, e = smooth(i * 0.12, 0.5 + i * 0.12, prog);
    const hh = (h / max) * 380 * e, ph = (REPORT.pending[i] / max) * 380 * e;
    g.fillStyle = acc; rr(g, x, base - hh, 96, hh, 10); g.fill();
    g.fillStyle = "#3a4a5e"; rr(g, x, base - hh - ph - 6, 96, ph, 8); g.fill();
    g.fillStyle = "#8ea0b4"; g.font = `500 20px ${f}`; g.textAlign = "center"; g.fillText(`${rp.week} ${i + 1}`, x + 48, 632); g.textAlign = "left";
  });
  ([[acc, rp.handled], ["#3a4a5e", rp.pending]] as const).forEach(([c, l], i) => {
    g.fillStyle = c; rr(g, 470 + i * 200, 156, 22, 22, 6); g.fill();
    g.fillStyle = "#c6d2de"; g.font = `500 20px ${f}`; g.fillText(l, 502 + i * 200, 168);
  });
  s.tex.needsUpdate = true;
}

/** Desk tablet: Office view (today's appointments and letters) and Election view (booths), every two ticks */
export function drawDesk(s: Screen, p: Paint, tick: number) {
  const g = s.g, f = p.font(), acc = p.accent(), ink = p.accentInk(), d = p.labels.desk;
  const election = Math.floor(tick / 2) % 2 === 1;
  g.fillStyle = "#f6f4f0"; g.fillRect(0, 0, DESK.w, DESK.h);
  g.textBaseline = "middle";
  g.font = `700 24px ${f}`;
  const officeW = g.measureText(d.office).width;
  [d.office, d.election].forEach((t, i) => {
    const active = (i === 1) === election;
    const w = g.measureText(t).width + 44, x = 36 + (i ? officeW + 56 : 0);
    g.fillStyle = active ? "#16130f" : "#ebe7e0"; rr(g, x, 26, w, 52, 26); g.fill();
    g.fillStyle = active ? "#f6f4f0" : "#59524a"; g.fillText(t, x + 22, 53);
  });
  g.fillStyle = acc; rr(g, DESK.w - 132, 30, 96, 44, 22); g.fill();
  g.fillStyle = ink; g.font = `700 22px ${f}`; g.textAlign = "center"; g.fillText("Setuk", DESK.w - 84, 53); g.textAlign = "left";
  const tiles: [string, string | number][] = election
    ? [[d.booths, "1,742"], [d.agents, "3,610"], [d.workers, "860"]]
    : [[d.appts, 14 - (tick % 5)], [d.letters, 36 + (tick % 4)], [d.pnr, 9]];
  tiles.forEach(([l, v], i) => {
    const x = 36 + i * 248;
    g.fillStyle = "#ebe7e0"; rr(g, x, 100, 232, 118, 18); g.fill();
    g.fillStyle = "#59524a"; g.font = `500 22px ${f}`; g.fillText(l, x + 20, 132);
    g.fillStyle = "#16130f"; g.font = `700 52px ${f}`; g.fillText(String(v), x + 20, 184);
  });
  g.fillStyle = "#59524a"; g.font = `600 20px ${f}`; g.fillText(d.next.toUpperCase(), 36, 256);
  const times = ["10:30", "11:00", "11:30", "12:15", "12:45"];
  for (let i = 0; i < 3; i++) {
    const y = 280 + i * 76;
    g.fillStyle = i === 0 ? acc : "#ebe7e0"; rr(g, 36, y, DESK.w - 72, 64, 16); g.fill();
    g.fillStyle = i === 0 ? ink : "#16130f";
    if (election) {
      g.font = `600 22px ${f}`; g.fillText(`${d.booth} ${112 + ((tick + i * 7) % 40)}`, 60, y + 32);
      g.font = `500 22px ${f}`; g.fillText(i === 2 ? d.pendingR : d.assigned, 220, y + 32);
    } else {
      g.font = `600 22px ${f}`; g.fillText(times[(tick + i) % times.length], 60, y + 32);
      g.font = `500 24px ${f}`; g.fillText(d.queue[(tick + i) % d.queue.length], 160, y + 32);
    }
  }
  s.tex.needsUpdate = true;
}
