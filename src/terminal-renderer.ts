// ============================
// PRETEXT-POWERED TERMINAL RENDERER
// ============================
// Generates ASCII box-drawn content sized to fill the container.
// Uses pretext for all text measurement and line wrapping.

import { prepareWithSegments, layoutWithLines, walkLineRanges } from "@chenglou/pretext";
import { experience, projects, research, contact, aboutMe } from "./content-data";
import type { ExperienceEntry, ProjectEntry, ContactEntry } from "./content-data";

// Default font — overridden at render time with actual computed font from DOM
let FONT = '"MS UI Gothic", monospace';
const REF_SIZE = 100;

// Cached width ratios (pixels / fontSize) — measured via pretext
let _textCharRatio: number | null = null;
let _cachedFont: string | null = null;

/** Measure width ratio of a character using pretext. */
function measureRatio(char: string): number {
	const p = prepareWithSegments(char, `${REF_SIZE}px ${FONT}`, { whiteSpace: "pre-wrap" });
	let w = 0;
	walkLineRanges(p, 1e6, (line) => { w = line.width; });
	return w / REF_SIZE;
}

/** Set the active font and invalidate cache if it changed. */
function setFont(font?: string): void {
	if (font && font !== _cachedFont) {
		_cachedFont = font;
		FONT = font;
		_textCharRatio = null; // re-measure with new font
	}
}

/** Width ratio for text characters. */
function textRatio(): number {
	if (!_textCharRatio) _textCharRatio = measureRatio("M");
	return _textCharRatio;
}

/** Reset cached measurements (call after font load). */
export function resetCharWidthCache(): void {
	_textCharRatio = null;
	_cachedFont = null;
}

// ============================
// PRETEXT TEXT WRAPPING
// ============================

/** Wrap text to fit `maxWidthPx` using pretext's layout engine. Returns plain-text lines. */
function wrapLines(text: string, maxWidthPx: number, fontSize: number): string[] {
	const font = `${fontSize}px ${FONT}`;
	const prepared = prepareWithSegments(text, font, { whiteSpace: "pre-wrap" });
	const { lines } = layoutWithLines(prepared, maxWidthPx, fontSize * 1.4);
	return lines.map((l) => l.text.trimEnd());
}

// ============================
// SIZING HELPERS
// ============================

/**
 * Compute how many columns fit in `px` pixels.
 * All box chars (+, -, |) are now single-width like text, so simple division.
 */
function pxToCols(px: number, fontSize: number): number {
	const charW = textRatio() * fontSize;
	const safePx = px * 0.81;
	return Math.max(10, Math.floor(safePx / charW));
}

/** Pixel width of `innerCols` text characters. */
function colsToPixels(innerCols: number, fontSize: number): number {
	return innerCols * textRatio() * fontSize;
}

// ============================
// BOX DRAWING
// ============================

function esc(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pad(s: string, len: number): string {
	if (s.length >= len) return s.substring(0, len);
	return s + " ".repeat(len - s.length);
}

// Single-width ASCII box chars — guaranteed same width as text in any monospace font.
// Unicode box-drawing chars (─│┌┐└┘) are double-width in MS UI Gothic,
// and canvas measureText disagrees with CSS rendering, making pixel alignment impossible.
const B = { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" };

/** +-- TITLE --------------------+ */
function boxTop(title: string, cols: number, cls?: string): string {
	const t = ` ${title} `;
	const fill = Math.max(0, cols - 3 - t.length);
	const inner = cls ? `<span class="${cls}" style="font-weight:bold">${esc(t)}</span>` : esc(t);
	return `${B.tl}${B.h}${inner}${B.h.repeat(fill)}${B.tr}`;
}

/** +-------------------------------+ */
function boxBot(cols: number): string {
	return `${B.bl}${B.h.repeat(cols - 2)}${B.br}`;
}

/** │ text               │  (inner content padded to fill) */
function boxLn(text: string, cols: number, cls?: string): string {
	const innerW = cols - 4; // │ + space ... space + │
	const padded = pad(text, innerW);
	const inner = cls ? `<span class="${cls}">${esc(padded)}</span>` : esc(padded);
	return `${B.v} ${inner} ${B.v}`;
}

/** │                    │ */
function boxEmpty(cols: number): string {
	return `${B.v} ${" ".repeat(cols - 4)} ${B.v}`;
}

// ============================
// PAGE RENDERERS
// ============================

/**
 * All renderers take `containerPx` (available pixel width) and `fontSize`
 * and generate box-drawn content that fills the full width.
 */

export function renderExperience(containerPx: number, fontSize: number, font?: string): string {
	setFont(font);
	const cols = pxToCols(containerPx, fontSize);
	const innerCols = cols - 4;
	const innerPx = colsToPixels(innerCols, fontSize);
	const out: string[] = [];

	out.push(`<span class="t-prompt">$</span> <span class="t-cmd">experience --list</span>`);
	out.push("");

	// Apple rainbow colors: green, yellow, orange, red, purple, blue
	const appleRainbow = ["#61BB46", "#FDB827", "#F5821F", "#E03A3E", "#963D97", "#009DDC"];

	for (let idx = 0; idx < (experience as ExperienceEntry[]).length; idx++) {
		const e = (experience as ExperienceEntry[])[idx];
		const roleColor = appleRainbow[idx % appleRainbow.length];
		out.push(boxTop(e.org, cols, "t-title"));
		out.push(boxEmpty(cols));
		const roleHtml = `<span style="color:${roleColor}">${esc(e.role)}</span>`;
		out.push(boxLnRich(roleHtml, e.role.length, cols));
		const metaHtml = `<span style="color:#888">${esc(`${e.date}  ${e.location}`)}</span>`;
		out.push(boxLnRich(metaHtml, `${e.date}  ${e.location}`.length, cols));
		out.push(boxEmpty(cols));
		for (const bullet of e.bullets) {
			const lines = wrapLines(`> ${bullet}`, innerPx, fontSize);
			for (let i = 0; i < lines.length; i++) {
				const text = i === 0 ? lines[i] : `  ${lines[i]}`;
				out.push(boxLn(text, cols, "t-white"));
			}
		}
		out.push(boxEmpty(cols));
		out.push(boxBot(cols));
		out.push("");
	}

	return `<pre class="terminal-box">${out.join("\n")}</pre>`;
}

export function renderProjects(containerPx: number, fontSize: number, font?: string): string {
	setFont(font);
	return renderItemList(projects, "ls projects/", containerPx, fontSize, true);
}

export function renderResearch(containerPx: number, fontSize: number, font?: string): string {
	setFont(font);
	return renderItemList(research, "ls research/", containerPx, fontSize, false);
}

function renderItemList(items: ProjectEntry[], cmd: string, containerPx: number, fontSize: number, showGithubLink: boolean): string {
	const cols = pxToCols(containerPx, fontSize);
	const innerCols = cols - 4;
	const innerPx = colsToPixels(innerCols, fontSize);
	const out: string[] = [];

	out.push(`<span class="t-prompt">$</span> <span class="t-cmd">${esc(cmd)}</span>`);
	out.push("");

	// Apple rainbow colors: green, yellow, orange, red, purple, blue
	const appleRainbow = ["#61BB46", "#FDB827", "#F5821F", "#E03A3E", "#963D97", "#009DDC"];

	for (let idx = 0; idx < items.length; idx++) {
		const item = items[idx];
		const titleColor = appleRainbow[idx % appleRainbow.length];
		out.push(boxTop(item.kicker, cols, "t-title"));
		out.push(boxEmpty(cols));
		const titleHtml = `<span style="color:${titleColor}">${esc(item.title)}</span>`;
		out.push(boxLnRich(titleHtml, item.title.length, cols));
		const dateHtml = `<span style="color:#888">${esc(item.date)}</span>`;
		out.push(boxLnRich(dateHtml, item.date.length, cols));
		out.push(boxEmpty(cols));
		const lines = wrapLines(item.description, innerPx, fontSize);
		for (const l of lines) out.push(boxLn(l, cols, "t-white"));
		if (item.url) {
			out.push(boxEmpty(cols));
			const linkHtml = `${esc("→ ")}<a href="${item.url}" target="_blank" rel="noopener" class="t-link-hover">${esc(item.url)}</a>`;
			out.push(boxLnRich(linkHtml, `→ ${item.url}`.length, cols));
		}
		out.push(boxEmpty(cols));
		out.push(boxBot(cols));
		out.push("");
	}

	if (showGithubLink) {
		out.push(`<span class="t-muted">→ <a href="https://github.com/Iemontine" target="_blank" rel="noopener" class="t-link">More on GitHub</a></span>`);
	}

	return `<pre class="terminal-box">${out.join("\n")}</pre>`;
}

export function renderContact(containerPx: number, fontSize: number, font?: string): string {
	setFont(font);
	const cols = pxToCols(containerPx, fontSize);
	const out: string[] = [];

	out.push(`<span class="t-prompt">$</span> <span class="t-cmd">contact --info</span>`);
	out.push("");

	out.push(boxTop("Links", cols, "t-title"));
	out.push(boxEmpty(cols));

	const brandColors: Record<string, string> = {
		GitHub: "#f0f0f0",
		LinkedIn: "#0A66C2",
		Steam: "#66c0f4",
		Discord: "#5865F2",
	};

	for (const c of contact as ContactEntry[]) {
		const label = pad(c.label, 10);
		const color = brandColors[c.label] || "var(--terminal-teal)";
		if (c.url) {
			const html = `<span style="color:${color}">${esc(label)}</span> <a href="${c.url}" target="_blank" rel="noopener" class="t-link">${esc(c.value)}</a>`;
			out.push(boxLnRich(html, (label + " " + c.value).length, cols));
		} else if (c.copyable) {
			const html = `<span style="color:${color}">${esc(label)}</span> <span class="t-link" style="cursor:pointer" data-copy="${esc(c.value)}" onclick="navigator.clipboard.writeText(this.dataset.copy).then(()=>{this.dataset.orig=this.dataset.orig||this.textContent;this.textContent='copied!                 ';setTimeout(()=>{this.textContent=this.dataset.orig},1200)})">${esc(c.value)}</span>`;
			out.push(boxLnRich(html, (label + " " + c.value).length, cols));
		} else {
			const html = `<span style="color:${color}">${esc(label)}</span> ${esc(c.value)}`;
			out.push(boxLnRich(html, (label + " " + c.value).length, cols));
		}
	}
	out.push(boxEmpty(cols));
	out.push(boxBot(cols));

	return `<pre class="terminal-box">${out.join("\n")}</pre>`;
}

// ============================
// RICH TEXT BOX HELPERS
// ============================

/** Box line with pre-built HTML. `plainLen` is the visible character count. */
function boxLnRich(html: string, plainLen: number, cols: number): string {
	const innerW = cols - 4;
	const padCount = Math.max(0, innerW - plainLen);
	return `${B.v} ${html}${" ".repeat(padCount)} ${B.v}`;
}

/**
 * Find named tokens in `text` and wrap them in colored spans.
 * Matches longest names first to avoid partial overlaps (e.g. "C++" before "C").
 */
type ColorToken = { name: string; color: string; bold?: boolean };
type TokenMatch = { start: number; end: number; color: string; bold?: boolean };

function findTokenMatches(text: string, tokens: ColorToken[]): TokenMatch[] {
	const sorted = [...tokens].sort((a, b) => b.name.length - a.name.length);
	const matches: TokenMatch[] = [];
	const used = new Set<number>();

	for (const { name, color, bold } of sorted) {
		let pos = 0;
		while ((pos = text.indexOf(name, pos)) !== -1) {
			let overlap = false;
			for (let i = pos; i < pos + name.length; i++) {
				if (used.has(i)) { overlap = true; break; }
			}
			if (!overlap) {
				matches.push({ start: pos, end: pos + name.length, color, bold });
				for (let i = pos; i < pos + name.length; i++) used.add(i);
			}
			pos += name.length;
		}
	}
	matches.sort((a, b) => a.start - b.start);
	return matches;
}

/** Apply pre-computed token matches to a character range [rangeStart, rangeEnd). */
function applyMatchesToRange(
	text: string, matches: TokenMatch[], rangeStart: number, rangeEnd: number,
): string {
	let html = "";
	let cursor = rangeStart;

	for (const m of matches) {
		if (m.end <= rangeStart || m.start >= rangeEnd) continue;
		const oStart = Math.max(m.start, rangeStart);
		const oEnd = Math.min(m.end, rangeEnd);
		if (oStart > cursor) html += esc(text.substring(cursor, oStart));
		const style = `color:${m.color}${m.bold ? ";font-weight:bold" : ""}`;
		html += `<span style="${style}">${esc(text.substring(oStart, oEnd))}</span>`;
		cursor = oEnd;
	}
	if (cursor < rangeEnd) html += esc(text.substring(cursor, rangeEnd));
	return html;
}

/**
 * Colorize tokens across wrapped lines, handling tokens split by line breaks.
 * Maps each wrapped line back to its offset in the original text.
 */
function colorizeWrappedLines(
	fullText: string, wrappedLines: string[], tokens: ColorToken[],
): string[] {
	const matches = findTokenMatches(fullText, tokens);
	const result: string[] = [];
	let searchFrom = 0;

	for (const line of wrappedLines) {
		// Find this line's position in the original text
		let lineStart = fullText.indexOf(line, searchFrom);
		if (lineStart === -1) {
			// Skip consumed whitespace at break point and retry
			let skip = searchFrom;
			while (skip < fullText.length && fullText[skip] === " ") skip++;
			lineStart = fullText.indexOf(line, skip);
		}
		if (lineStart === -1) {
			// Fallback: colorize per-line
			result.push(applyMatchesToRange(line, findTokenMatches(line, tokens), 0, line.length));
			continue;
		}

		const lineEnd = lineStart + line.length;
		result.push(applyMatchesToRange(fullText, matches, lineStart, lineEnd));
		searchFrom = lineEnd;
	}

	return result;
}

// ============================
// ABOUT ME RENDERER
// ============================

/**
 * Render a label:value pair where continuation lines align with the value column.
 * Wraps the value at reduced width so label + value never exceeds the box.
 */
function labeledLines(
	label: string, labelStyle: string, value: string,
	cols: number, innerCols: number, fontSize: number,
): string[] {
	const labelLen = label.length;
	const valuePx = colsToPixels(Math.max(1, innerCols - labelLen), fontSize);
	const valueLines = wrapLines(value, valuePx, fontSize);
	const result: string[] = [];

	for (let i = 0; i < valueLines.length; i++) {
		const prefixHtml = i === 0
			? `<span style="${labelStyle}">${esc(label)}</span>`
			: esc(" ".repeat(labelLen));
		const html = prefixHtml + `<span style="color:var(--terminal-white)">${esc(valueLines[i])}</span>`;
		result.push(boxLnRich(html, labelLen + valueLines[i].length, cols));
	}

	return result;
}

export function renderAboutMe(containerPx: number, fontSize: number, font?: string): string {
	setFont(font);
	const cols = pxToCols(containerPx, fontSize);
	const innerCols = cols - 4;
	const innerPx = colsToPixels(innerCols, fontSize);
	const out: string[] = [];
	const labelColor = "#409584";

	out.push(`<span class="t-prompt">$</span> <span class="t-cmd">whoami</span>`);
	out.push(`<span class="t-muted">${esc(aboutMe.version)}</span>`);
	out.push("");

	// ── Currents Box ──
	out.push(boxTop("currents", cols, "t-title"));
	out.push(boxEmpty(cols));

	const maxLbl = Math.max(...aboutMe.currents.map(c => `${c.label}:`.length));
	for (const curr of aboutMe.currents) {
		const label = `${curr.label}:` + " ".repeat(maxLbl + 1 - `${curr.label}:`.length);
		const style = `color:${curr.color};text-shadow:0 0 3px ${curr.color}`;
		out.push(...labeledLines(label, style, curr.value, cols, innerCols, fontSize));
	}

	out.push(boxEmpty(cols));
	out.push(boxBot(cols));
	out.push("");

	// ── About Box ──
	out.push(boxTop("about", cols, "t-title"));
	out.push(boxEmpty(cols));

	// Intro
	{
		const introPlain = `I'm ${aboutMe.name}, you might also know me as ${aboutMe.nickname}!`;
		const lines = wrapLines(introPlain, innerPx, fontSize);
		for (const line of lines) {
			const idx = line.indexOf(aboutMe.name);
			if (idx >= 0) {
				const before = line.substring(0, idx);
				const after = line.substring(idx + aboutMe.name.length);
				const html = `${esc(before)}<span class="highlight-name">${esc(aboutMe.name)}</span>${esc(after)}`;
				out.push(boxLnRich(html, line.length, cols));
			} else {
				out.push(boxLn(line, cols));
			}
		}
	}
	out.push(boxEmpty(cols));

	// Details (bio + hobbies/enjoys/specs)
	const allDetails = [{ label: "bio", value: aboutMe.bio }, ...aboutMe.details];
	for (const detail of allDetails) {
		const label = `${detail.label}: `;
		const style = `color:${labelColor};font-weight:bold`;
		out.push(...labeledLines(label, style, detail.value, cols, innerCols, fontSize));
	}
	out.push(boxEmpty(cols));
	out.push(boxBot(cols));
	out.push("");

	// ── Favorites Box ──
	out.push(boxTop("favorites", cols, "t-title"));
	out.push(boxEmpty(cols));

	for (const fav of aboutMe.favorites) {
		const label = `${fav.category}: `;
		const style = `color:${fav.color}`;
		out.push(...labeledLines(label, style, fav.items, cols, innerCols, fontSize));
	}

	out.push(boxEmpty(cols));
	out.push(boxBot(cols));
	out.push("");

	// ── Tech Box ──
	out.push(boxTop("tech", cols, "t-title"));
	out.push(boxEmpty(cols));

	// Skills
	{
		const label = "proficient in: ";
		const valuePx = colsToPixels(Math.max(1, innerCols - label.length), fontSize);
		const valueText = aboutMe.skills.map(s => s.name).join(", ");
		const valueLines = wrapLines(valueText, valuePx, fontSize);
		const skillTokens = aboutMe.skills.map(s => ({ name: s.name, color: s.color, bold: true }));
		const coloredLines = colorizeWrappedLines(valueText, valueLines, skillTokens);

		for (let i = 0; i < valueLines.length; i++) {
			const prefix = i === 0 ? esc(label) : esc(" ".repeat(label.length));
			const html = prefix + coloredLines[i];
			out.push(boxLnRich(html, label.length + valueLines[i].length, cols));
		}
	}
	out.push(boxEmpty(cols));

	// APIs
	{
		const label = "experience with apis: ";
		const valuePx = colsToPixels(Math.max(1, innerCols - label.length), fontSize);
		const valueText = aboutMe.apis.join(", ");
		const valueLines = wrapLines(valueText, valuePx, fontSize);
		const apiTokens = aboutMe.apis.map(name => ({ name, color: aboutMe.apiColor }));
		const coloredLines = colorizeWrappedLines(valueText, valueLines, apiTokens);

		for (let i = 0; i < valueLines.length; i++) {
			const prefix = i === 0 ? esc(label) : esc(" ".repeat(label.length));
			const html = prefix + coloredLines[i];
			out.push(boxLnRich(html, label.length + valueLines[i].length, cols));
		}
	}
	out.push(boxEmpty(cols));

	// Specs
	{
		const label = "SPECS: ";
		const style = `color:${labelColor};font-weight:bold`;
		out.push(...labeledLines(label, style, aboutMe.specs, cols, innerCols, fontSize));
	}
	out.push(boxEmpty(cols));
	out.push(boxBot(cols));

	return `<pre class="terminal-box">${out.join("\n")}</pre>`;
}