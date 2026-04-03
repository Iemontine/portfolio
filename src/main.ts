import "./style.css";
import { asciiArts, defaultAscii } from "./ascii-art";
import { prepareWithSegments, walkLineRanges, clearCache, type PreparedTextWithSegments } from "@chenglou/pretext";
import { renderExperience, renderProjects, renderResearch, renderContact, renderAboutMe, resetCharWidthCache } from "./terminal-renderer";

// ============================
// INTERFACES & TYPES
// ============================

interface WindowConfig {
	id: string;
	title: string;
	content: string;
	width?: number;
	height?: number;
	theme?: "default";
}

interface DesktopIcon {
	id: string;
	label: string;
	windowId: string;
}

// ============================
// WINDOW MANAGER
// ============================

class WindowManager {
	private windows: Map<string, HTMLElement> = new Map();
	// Z-order is determined by DOM order in #window-container;
	// last child renders on top. No global z-index counter needed.
	private currentContentWindow: string | null = null;
	private asciiWindow: HTMLElement | null = null;

	// ASCII enter/exit handlers (cancel in-flight animations)
	private asciiEnterHandler: ((ev: AnimationEvent) => void) | null = null;
	private asciiExitHandler: ((ev: AnimationEvent) => void) | null = null;

	// ASCII typing state (line-by-line animation)
	private targetText: string = "";
	private animationFrameId: number | null = null;
	private typingMode: "idle" | "deleting" | "typing" = "idle";
	// Font sizing: tracks which full art the current font size is based on
	private sizingArt: string = "";
	private targetMaxPx: number = 14;

	// Window state management for maximize/restore
	// Shared maximization state for content windows (not About Me)
	private isContentWindowMaximized: boolean = false;

	// About Me window (independent)
	private aboutMeWindow: HTMLElement | null = null;

	// Pretext measurement cache (keyed by ASCII art text at reference font size)
	private pretextCache: Map<string, PreparedTextWithSegments> = new Map();
	private static readonly FONT_FAMILY = 'Consolas, "Courier New", monospace';
	private static readonly REF_FONT_SIZE = 100;

	constructor() {
		this.initializeDesktop();
		this.createTopRightBoxes();
		this.showAboutMe(); // About Me appears automatically on load
		this.createAsciiWindow();

		// Responsive updates on resize
		window.addEventListener("resize", () => {
			this.handleResize();
			this.recalcAsciiFontSizeIfReady();
		});

		// Keep ASCII responsive to container mutations/zoom
		const setupAsciiObserver = () => {
			if (!this.asciiWindow) return;
			const asciiElement = this.asciiWindow.querySelector(
				".ascii-art"
			) as HTMLElement | null;
			if (!asciiElement) return;
			const ro = new ResizeObserver(() => {
				this.recalcAsciiFontSizeIfReady();
			});
			ro.observe(this.asciiWindow);
		};

		// Defer to ensure asciiWindow exists
		setTimeout(setupAsciiObserver, 0);

		// Ensure custom font is loaded before pretext canvas measurement
		document.fonts.ready.then(() => {
			// Clear pretext caches in case early measurements used fallback font
			this.pretextCache.clear();
			clearCache();
			resetCharWidthCache();
			this.recalcAsciiFontSizeIfReady();
		});
	}

	private handleResize(): void {
		this.updateAsciiWindow();
	}

	private initializeDesktop(): void {
		const desktop = document.getElementById("desktop")!;

		const icons: DesktopIcon[] = [
			{ id: "research-icon", label: "Research", windowId: "research" },
			{ id: "projects-icon", label: "Projects", windowId: "projects" },
			{ id: "experience-icon", label: "Experience", windowId: "experience" },
			{ id: "contact-icon", label: "Contact", windowId: "contact" },
		];

		icons.forEach((icon) => {
			const iconElement = this.createDesktopIcon(icon);
			desktop.appendChild(iconElement);
		});

		// About Me icon sits behind its window
		this.createAboutMeIcon();
	}

	private createDesktopIcon(icon: DesktopIcon): HTMLElement {
		const iconElement = document.createElement("div");
		iconElement.className = "desktop-icon";
		iconElement.setAttribute("data-window", icon.windowId);

		iconElement.innerHTML = `
      <div class="icon"></div>
      <div class="label">${icon.label}</div>
    `;

		iconElement.addEventListener("click", () => {
			this.toggleWindow(icon.windowId);
		});

		return iconElement;
	}

	public toggleWindow(windowId: string): void {
		// If visible, clicking its icon closes it
		if (this.currentContentWindow === windowId && this.windows.has(windowId)) {
			// Let closeWindow manage state and ASCII update
			this.closeWindow(windowId);
			return;
		}
		// Otherwise, open/switch
		this.openWindow(windowId);
	}

	private createTopRightBoxes(): void {
		const container = document.getElementById("top-right-container")!;
		container.className = "top-right-container";

		// Box 1: Data Matrix (wider)
		const dataBox = document.createElement("div");
		dataBox.className = "info-box data-matrix";
		// Append first so measurements are correct
		container.appendChild(dataBox);
		// Generate after layout to ensure correct sizing
		requestAnimationFrame(() => {
			dataBox.innerHTML = this.generateColumnsForBox(dataBox);
		});
		// Update columns when the box resizes
		const ro = new ResizeObserver(() => {
			dataBox.innerHTML = this.generateColumnsForBox(dataBox);
		});
		ro.observe(dataBox);

		// Box 2: Stats (narrow)
		const statsBox = document.createElement("div");
		statsBox.className = "info-box stats";
		statsBox.innerHTML = `
	      <div class="stat"><span class="label">S:</span><span class="value" id="stat-speed">2.67</span></div>
	      <div class="stat"><span class="label">N:</span><span class="value" id="stat-count">1002</span></div>
	      <div class="stat"><span class="label">T:</span><span class="value" id="stat-temp">45.6</span></div>
	    `;
		container.appendChild(statsBox);

		// Box 3: Logo (square)
		const logoBox = document.createElement("div");
		logoBox.className = "info-box logo";
		const img = document.createElement("img");
		img.className = "logo-img logo-spin";
		img.setAttribute("aria-hidden", "true");
		img.setAttribute("role", "presentation");
		img.decoding = "async";
		(img as any).loading = "eager";
		img.src = "clem.png";
		logoBox.appendChild(img);
		container.appendChild(logoBox);

		// Animate stats only (keep matrix intact)
		setInterval(() => {
			this.updateStats(statsBox);
		}, 2000);
	}

	private generateColumns(colCount: number, heightRows: number): string {
		const alphabets = [
			"░▒▓█",
			"·•◦",
			"01",
			"⟡✦✧",
			"⎯⎯⎯",
			"abcdef",
			"+=-",
			"∴∵∶",
		];
		const dir = (i: number) => (i % 2 === 0 ? 1 : -1);
		let html = '<div class="data-columns">';
		for (let i = 0; i < colCount; i++) {
			const ab = alphabets[i % alphabets.length];
			let stream = "";
			for (let r = 0; r < heightRows; r++) {
				stream += ab[Math.floor(Math.random() * ab.length)] + "\n";
			}
			const dur = (6 + Math.random() * 5).toFixed(1);
			// Randomize animation phase so columns are desynced without re-rendering
			const delay = (Math.random() * parseFloat(dur)).toFixed(2);
			const direction = dir(i);
			html += `<div class=\"data-col\"><span class=\"data-stream\" style=\"animation-duration:${dur}s; animation-direction:${
				direction > 0 ? "normal" : "reverse"
			}; animation-delay:-${delay}s;\">${stream}</span></div>`;
		}
		html += "</div>";
		return html;
	}

	private generateColumnsForBox(box: HTMLElement): string {
		const cs = getComputedStyle(box);
		const padL = parseFloat(cs.paddingLeft || "0");
		const padR = parseFloat(cs.paddingRight || "0");
		const padT = parseFloat(cs.paddingTop || "0");
		const padB = parseFloat(cs.paddingBottom || "0");
		const innerW = Math.max(0, box.clientWidth - padL - padR);
		const innerH = Math.max(0, box.clientHeight - padT - padB);
		const colW = 10; // must match CSS grid-auto-columns
		const gap = 4; // must match CSS gap
		const colCount = Math.max(10, Math.ceil((innerW + gap) / (colW + gap)));
		const linePx = 9; // must match .data-stream font-size * line-height
		const rows = Math.max(24, Math.ceil(innerH / linePx) * 2);
		return this.generateColumns(colCount, rows);
	}

	private updateStats(container: HTMLElement): void {
		const speed = (1.8 + Math.random() * 1.6).toFixed(2);
		const count = (900 + Math.floor(Math.random() * 400)).toString();
		const temp = (35 + Math.random() * 20).toFixed(1);
		const s = container.querySelector("#stat-speed") as HTMLElement;
		const c = container.querySelector("#stat-count") as HTMLElement;
		const t = container.querySelector("#stat-temp") as HTMLElement;
		if (s) s.textContent = speed;
		if (c) c.textContent = count;
		if (t) t.textContent = temp;
	}

	private createAboutMeIcon(): void {
		const aboutIcon = document.createElement("div");
		aboutIcon.className = "desktop-icon about-me-icon";
		aboutIcon.setAttribute("data-window", "about-me");

		aboutIcon.innerHTML = `
      <div class="icon"></div>
      <div class="label">About Me</div>
    `;

		aboutIcon.addEventListener("click", () => {
			this.toggleAboutMe();
		});

		aboutIcon.style.position = "absolute";
		aboutIcon.style.bottom = "0px";
		aboutIcon.style.right = "0px";

		const desktop = document.getElementById("desktop")!;
		desktop.appendChild(aboutIcon);
	}

	public openWindow(windowId: string): void {
		// If the same window is already open, just bring it to front and ensure ASCII is correct
		if (this.windows.has(windowId)) {
			this.currentContentWindow = windowId;
			this.updateAsciiWindow();
			this.moveWindowToFront(windowId);
			return;
		}

		// Set the target FIRST so ASCII swaps immediately to the right art
		this.currentContentWindow = windowId;
		this.updateAsciiWindow();

		// Ensure at-most-one content window is visible: instantly close others
		this.closeAllContentWindows({
			exceptId: windowId,
			instant: true,
			suppressAscii: true,
		});

		const config = this.getWindowConfig(windowId);
		if (config) {
			this.createWindow(config);
		}
	}

	// Close all content windows with options to instantly hide and suppress ASCII updates
	private closeAllContentWindows(options?: {
		exceptId?: string;
		instant?: boolean;
		suppressAscii?: boolean;
	}): void {
		const exceptId = options?.exceptId || null;
		const instant = options?.instant === true;
		const suppress = options?.suppressAscii === true;
		this.windows.forEach((_, id) => {
			if (id === exceptId) return;
			this.closeWindow(id, { instant, suppressAscii: suppress });
		});
	}

	public toggleAboutMe(): void {
		if (this.aboutMeWindow) {
			// About Me exists, toggle its visibility
			if (this.aboutMeWindow.style.display === "none") {
				this.animateAboutShow(this.aboutMeWindow);
				this.bringAboutMeToFront();
				// Update ASCII immediately when showing
				this.updateAsciiWindow();
			} else {
				// Hide with exit animation; ASCII updates after animation end
				this.animateAboutHide(this.aboutMeWindow);
			}
		} else {
			// About Me doesn't exist, create it
			this.showAboutMe();
		}
	}

	private showAboutMe(): void {
		const windowContainer = document.getElementById("window-container")!;

		const aboutElement = document.createElement("div");
		aboutElement.className = "terminal-window about-window";
		aboutElement.id = "about-me-window";
		aboutElement.dataset.maximized = "false";

		aboutElement.innerHTML = `
      <div class="window-titlebar">
        <div class="window-controls">
          <div class="window-control close" data-action="close"></div>
          <div class="window-control minimize" data-action="minimize"></div>
          <div class="window-control maximize" data-action="maximize"></div>
        </div>
        <div class="window-title">about me</div>
      </div>
      <div class="window-content content-fade-in">
      </div>
    `;

		this.setupAboutMeControls(aboutElement);

		windowContainer.appendChild(aboutElement);
		this.aboutMeWindow = aboutElement;

		// Set up ResizeObserver for pretext-powered re-rendering (same as content windows)
		const contentEl = aboutElement.querySelector(".window-content") as HTMLElement;
		if (contentEl) {
			// Initial render
			this.rerenderContentWindow("about-me", contentEl);
			const ro = new ResizeObserver(() => {
				this.rerenderContentWindow("about-me", contentEl);
			});
			ro.observe(contentEl);
			(aboutElement as any)._contentResizeObserver = ro;
		}

		this.animateAboutShow(aboutElement);
		this.updateAsciiWindow();
	}

	private setupAboutMeControls(aboutElement: HTMLElement): void {
		const controls = aboutElement.querySelectorAll(".window-control");

		controls.forEach((control) => {
			control.addEventListener("click", (e) => {
				e.stopPropagation();
				const action = (control as HTMLElement).dataset.action;

				switch (action) {
					case "close":
						this.animateAboutHide(this.aboutMeWindow!);
						break;
					case "minimize":
						// For About Me, minimize hides with animation
						this.animateAboutHide(this.aboutMeWindow!);
						break;
					case "maximize":
						this.maximizeAboutMe();
						break;
				}
			});
		});
	}

	private animateAboutShow(el: HTMLElement): void {
		el.style.display = "block";
		el.classList.remove("about-exit");
		el.classList.add("about-enter");
		const onEnd = () => {
			el.classList.remove("about-enter");
			el.removeEventListener("animationend", onEnd);
		};
		el.addEventListener("animationend", onEnd);
	}

	private animateAboutHide(el: HTMLElement, after?: () => void): void {
		if (el.style.display === "none") {
			if (after) after();
			this.updateAsciiWindow();
			return;
		}
		el.classList.remove("about-enter");
		el.classList.add("about-exit");
		const onEnd = () => {
			el.classList.remove("about-exit");
			el.style.display = "none";
			el.removeEventListener("animationend", onEnd);
			if (after) after();
			this.updateAsciiWindow();
		};
		el.addEventListener("animationend", onEnd);
	}

	private maximizeAboutMe(): void {
		if (!this.aboutMeWindow) return;
		const el = this.aboutMeWindow;
		const isMax = el.dataset.maximized === "true";

		// FLIP animation for smooth transition
		const first = el.getBoundingClientRect();
		const prevTransition = el.style.transition;

		el.style.transition = "none";
		el.style.transform = "none";
		el.style.transformOrigin = "bottom right";

		// Toggle maximized state (CSS handles the layout)
		el.dataset.maximized = isMax ? "false" : "true";
		if (!isMax) this.bringAboutMeToFront();

		const last = el.getBoundingClientRect();

		const scaleX = first.width / last.width || 1;
		const scaleY = first.height / last.height || 1;
		const translateX = first.right - last.right;
		const translateY = first.bottom - last.bottom;

		// Invert: start from old layout visually
		el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

		// Force reflow
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		el.offsetWidth;

		// Animate to identity
		el.style.transition = "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)";
		el.style.transform = "none";

		const onEnd = () => {
			el.style.transition = prevTransition;
			el.style.transformOrigin = "";
			el.style.transform = "";
			el.removeEventListener("transitionend", onEnd);
		};
		el.addEventListener("transitionend", onEnd);
	}

	private bringAboutMeToFront(): void {
		if (!this.aboutMeWindow) return;
		const container = document.getElementById("window-container");
		if (!container) return;
		const last = container.lastElementChild;
		if (last !== this.aboutMeWindow) {
			container.appendChild(this.aboutMeWindow);
		}
	}

	private getWindowConfig(windowId: string): WindowConfig | null {
		const configs: Record<string, WindowConfig> = {
			research: {
				id: "research",
				title: "research",
				content: "",
				theme: "default",
			},
			projects: {
				id: "projects",
				title: "projects",
				content: "",
				theme: "default",
			},
			experience: {
				id: "experience",
				title: "experience",
				content: "",
				theme: "default",
			},
			contact: {
				id: "contact",
				title: "contact information",
				content: "",
				theme: "default",
			},
		};

		return configs[windowId] || null;
	}

	private createWindow(config: WindowConfig): void {
		const windowContainer = document.getElementById("window-container")!;

		const windowElement = document.createElement("div");

		windowElement.className = `terminal-window ${config.theme || "default"}`;
		windowElement.id = `window-${config.id}`;

		// CSS handles all sizing — just set maximized state
		windowElement.dataset.maximized = this.isContentWindowMaximized ? "true" : "false";

	// DOM order controls stacking; append later for front-most

		windowElement.innerHTML = `
      <div class="window-titlebar">
        <div class="window-controls">
          <div class="window-control close" data-action="close"></div>
          <div class="window-control minimize" data-action="minimize"></div>
          <div class="window-control maximize" data-action="maximize"></div>
        </div>
        <div class="window-title">${config.title}</div>
      </div>
      <div class="window-content content-fade-in">
        ${config.content}
      </div>
    `;

		// Add window controls event listeners
		this.setupWindowControls(windowElement, config.id);

		// Add enter animation
		windowElement.classList.add("window-enter");
		setTimeout(() => windowElement.classList.remove("window-enter"), 400);

		// Append once; DOM order ensures it's on top
		windowContainer.appendChild(windowElement);
		this.windows.set(config.id, windowElement);

		// Observe content area for resize → re-render terminal boxes with pretext
		const contentEl = windowElement.querySelector(".window-content") as HTMLElement | null;
		if (contentEl) {
			const ro = new ResizeObserver(() => {
				this.rerenderContentWindow(config.id, contentEl);
			});
			ro.observe(contentEl);
			// Store observer so we can disconnect on close
			(windowElement as any)._contentResizeObserver = ro;
		}

		// Focus the window — use click (not mousedown) so DOM reorder
		// doesn't swallow the click event on window controls
		windowElement.addEventListener("click", () => {
			this.moveWindowToFront(config.id);
		});
	}

	private setupWindowControls(
		windowElement: HTMLElement,
		windowId: string
	): void {
		const controls = windowElement.querySelectorAll(".window-control");

		controls.forEach((control) => {
			control.addEventListener("click", (e) => {
				e.stopPropagation();
				const action = (control as HTMLElement).dataset.action;

				switch (action) {
					case "close":
						this.closeWindow(windowId);
						break;
					case "minimize":
						this.minimizeWindow(windowId);
						break;
					case "maximize":
						this.maximizeWindow(windowId);
						break;
				}
			});
		});
	}

	private moveWindowToFront(windowId: string): void {
		const windowElement = this.windows.get(windowId);
		const container = document.getElementById("window-container");
		if (!windowElement || !container) return;
			// Move node to end only if not already last to avoid animation restarts
			const last = container.lastElementChild;
			if (last !== windowElement) {
				container.appendChild(windowElement);
			}
	}

	private closeWindow(
		windowId: string,
		opts?: { suppressAscii?: boolean; instant?: boolean }
	): void {
		const windowElement = this.windows.get(windowId);
		if (!windowElement) return;

		const suppressAscii = !!opts?.suppressAscii;
		const instant = !!opts?.instant;

		if (instant) {
			// Remove immediately to guarantee single-window visibility
			(windowElement as any)._contentResizeObserver?.disconnect();
			windowElement.remove();
			this.windows.delete(windowId);
			if (!suppressAscii && windowId === this.currentContentWindow) {
				this.currentContentWindow = null;
				this.updateAsciiWindow();
			}
			return;
		}

		windowElement.classList.add("window-exit");
		setTimeout(() => {
			(windowElement as any)._contentResizeObserver?.disconnect();
			windowElement.remove();
			this.windows.delete(windowId);

			// Update ASCII window when the active content window is closed
			if (!suppressAscii && windowId === this.currentContentWindow) {
				this.currentContentWindow = null;
				this.updateAsciiWindow();
			}
		}, 300);
	}

	private minimizeWindow(windowId: string): void {
		// For this demo, minimize will just close the window
		this.closeWindow(windowId);
	}

	private maximizeWindow(windowId: string): void {
		const windowElement = this.windows.get(windowId);
		if (!windowElement) return;

		const isMax = windowElement.dataset.maximized === "true";
		windowElement.dataset.maximized = isMax ? "false" : "true";
		this.isContentWindowMaximized = !isMax;

		if (!isMax) this.moveWindowToFront(windowId);
	}

	// ============================
	// CONTENT METHODS
	// ============================

	// Font size now read from computed style in rerenderContentWindow

	/** Re-render a content window's terminal boxes using pretext at the new width. */
	private rerenderContentWindow(windowId: string, contentEl: HTMLElement): void {
		const cs = getComputedStyle(contentEl);
		const px = contentEl.clientWidth - parseFloat(cs.paddingLeft || "0") - parseFloat(cs.paddingRight || "0");
		if (px <= 0) return;
		// Get the ACTUAL font the browser is using, so pretext measures with the same font
		const computedFont = cs.fontFamily;
		const computedFontSize = parseFloat(cs.fontSize || "14");
		const renderers: Record<string, (px: number, fs: number, font?: string) => string> = {
			research: renderResearch,
			projects: renderProjects,
			experience: renderExperience,
			contact: renderContact,
			"about-me": renderAboutMe,
		};
		const render = renderers[windowId];
		if (!render) return;
		const scrollTop = contentEl.scrollTop;
		contentEl.innerHTML = render(px, computedFontSize, computedFont);
		contentEl.scrollTop = scrollTop;
	}

	// ============================
	// ASCII WINDOW SYSTEM
	// ============================

	private createAsciiWindow(): void {
		const asciiWindow = document.createElement("div");
		asciiWindow.className = "ascii-window";
		asciiWindow.id = "ascii-window";

		asciiWindow.innerHTML = `
      <div class="ascii-content ascii-content-enter">
        <pre class="ascii-art"></pre>
      </div>
    `;

		// Anchor inside window-container so padding is relative to inner border
		const container = document.getElementById("window-container");
		if (container) {
			container.appendChild(asciiWindow);
		} else {
			document.body.appendChild(asciiWindow);
		}
		this.asciiWindow = asciiWindow;
		this.updateAsciiWindow();
	}

	private getAsciiArt(windowId: string | null): string {
		return asciiArts[windowId || "about-me"] || defaultAscii;
	}

	private updateAsciiWindow(): void {
		if (!this.asciiWindow) return;
		const aw = this.asciiWindow as HTMLElement;

		// ASCII art should show when:
		// 1. Content windows are open (priority), OR
		// 2. About Me is visible and no content windows are open
		const hasContentWindow = this.currentContentWindow !== null;
		const aboutMeVisible = !!(
			this.aboutMeWindow && this.aboutMeWindow.style.display !== "none"
		);
		const shouldShow = hasContentWindow || aboutMeVisible;

		const asciiElement = aw.querySelector(".ascii-art") as HTMLElement | null;

		if (!shouldShow) {
			// Animate out if currently visible
			if (aw.style.display !== "none") {
				// Cancel an in-flight enter to avoid double-listener and ensure we exit cleanly
				if (aw.classList.contains("ascii-enter")) {
					if (this.asciiEnterHandler)
						aw.removeEventListener("animationend", this.asciiEnterHandler);
					aw.classList.remove("ascii-enter");
					this.asciiEnterHandler = null;
				}
				aw.classList.remove("ascii-enter");
				aw.classList.add("ascii-exit");
				const onEnd = () => {
					aw.classList.remove("ascii-exit");
					aw.style.display = "none";
					// Clear content so next show starts from empty (no deletion artifacts)
					if (asciiElement) asciiElement.textContent = "";
					// Reset typing state fully
					if (this.animationFrameId) {
						cancelAnimationFrame(this.animationFrameId);
						this.animationFrameId = null;
					}
					this.typingMode = "idle";
					this.targetText = "";
					this.sizingArt = "";
					// Remove dynamic line-height override so we recompute next time
					aw.style.removeProperty("--ascii-line-height");
					aw.removeEventListener("animationend", onEnd);
					this.asciiExitHandler = null;
				};
				this.asciiExitHandler = onEnd;
				aw.addEventListener("animationend", onEnd);
			} else {
				// Already hidden; ensure empty content
				if (asciiElement) asciiElement.textContent = "";
			}
			return;
		}

		// Ensure visible and animate in when coming from hidden
		// Cancel a pending exit if we're showing again quickly
		if (aw.classList.contains("ascii-exit")) {
			if (this.asciiExitHandler)
				aw.removeEventListener("animationend", this.asciiExitHandler);
			aw.classList.remove("ascii-exit");
			this.asciiExitHandler = null;
		}

		if (aw.style.display === "none") {
			aw.style.display = "block";
			aw.style.visibility = "visible";
			aw.classList.add("ascii-enter");
			const onEndIn = () => {
				aw.classList.remove("ascii-enter");
				aw.removeEventListener("animationend", onEndIn);
				this.asciiEnterHandler = null;
			};
			this.asciiEnterHandler = onEndIn;
			aw.addEventListener("animationend", onEndIn);
		} else {
			// Ensure visible
			aw.style.display = "block";
			aw.style.visibility = "visible";
		}

		// Content windows take priority over About Me for ASCII art
		const activeWindowId = this.currentContentWindow || "about-me";
		const asciiArt = this.getAsciiArt(activeWindowId);

		// Calculate target font size and apply/transition as needed
		if (asciiElement) {
			this.targetMaxPx = 64;
			const size = this.calculateOptimalFontSize(asciiArt, 64);
			const current = asciiElement.textContent || "";

			if (!current.length) {
				// First show — apply immediately, no transition needed
				this.sizingArt = asciiArt;
				if (size > 0) asciiElement.style.fontSize = `${size}px`;
			} else if (current === asciiArt || this.targetText === asciiArt) {
				// Same art (e.g. resize) — just update the font size, no transition
				this.sizingArt = asciiArt;
				if (size > 0) asciiElement.style.fontSize = `${size}px`;
				return;
			}
			// Different art — transition handles font size at delete→type boundary

			this.startTransition(asciiArt, asciiElement);
		}
	}

	private startTransition(nextText: string, asciiElement: HTMLElement): void {
		const current = asciiElement.textContent || "";
		if (current === nextText) {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			this.typingMode = "idle";
			this.targetText = nextText;
			// Ensure sizing matches (e.g. after resize while idle)
			this.sizingArt = nextText;
			return;
		}

		this.targetText = nextText;

		// Cancel any in-flight animation
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		// Line-by-line animation: find common prefix lines, delete then type the rest
		const currentLines = current ? current.split("\n") : [];
		const targetLines = nextText.split("\n");
		let commonLines = 0;
		while (commonLines < Math.min(currentLines.length, targetLines.length)
			&& currentLines[commonLines] === targetLines[commonLines]) {
			commonLines++;
		}

		const linesToDelete = currentLines.length - commonLines;
		const linesToType = targetLines.length - commonLines;
		// Constant speed: same lines-per-frame regardless of art size
		const delPerFrame = 5;
		const typePerFrame = 3;

		let displayCount = currentLines.length;

		const applyTargetFontSize = () => {
			this.sizingArt = nextText;
			const size = this.calculateOptimalFontSize(nextText, this.targetMaxPx);
			if (size > 0) asciiElement.style.fontSize = `${size}px`;
		};

		const runTyping = () => {
			if (linesToType === 0) {
				asciiElement.textContent = nextText;
				this.typingMode = "idle";
				this.animationFrameId = null;
				return;
			}

			this.typingMode = "typing";
			let typedTo = commonLines;
			const typeStep = () => {
				if (this.typingMode !== "typing") return;
				typedTo = Math.min(targetLines.length, typedTo + typePerFrame);
				if (typedTo >= targetLines.length) {
					asciiElement.textContent = nextText;
					this.typingMode = "idle";
					this.animationFrameId = null;
					return;
				}
				asciiElement.textContent = targetLines.slice(0, typedTo).join("\n");
				this.animationFrameId = requestAnimationFrame(typeStep);
			};
			this.animationFrameId = requestAnimationFrame(typeStep);
		};

		if (linesToDelete > 0) {
			this.typingMode = "deleting";
			const deleteStep = () => {
				if (this.typingMode !== "deleting") return;
				displayCount = Math.max(commonLines, displayCount - delPerFrame);
				if (displayCount <= commonLines) {
					asciiElement.textContent = currentLines.slice(0, commonLines).join("\n");
					// Switch font size at the deletion→typing boundary
					applyTargetFontSize();
					runTyping();
					return;
				}
				asciiElement.textContent = currentLines.slice(0, displayCount).join("\n");
				this.animationFrameId = requestAnimationFrame(deleteStep);
			};
			this.animationFrameId = requestAnimationFrame(deleteStep);
		} else {
			// No deletion — apply target font size and start typing
			applyTargetFontSize();
			runTyping();
		}
	}

	/**
	 * Compute the largest font size that fits asciiContent inside the ASCII window.
	 *
	 * Uses pretext to measure the art's natural width at a reference font size
	 * (cached per art). Font metrics scale linearly, so we divide the container
	 * dimensions by the measured proportions to get the optimal size.
	 */
	private calculateOptimalFontSize(
		asciiContent: string,
		maxPx: number = 14
	): number {
		if (!this.asciiWindow) return 4;

		// Read container inner dimensions
		const contentEl = this.asciiWindow.querySelector(".ascii-content") as HTMLElement | null;
		const el = contentEl || this.asciiWindow;
		const cs = getComputedStyle(el);
		const innerW = Math.max(0, el.clientWidth - parseFloat(cs.paddingLeft || "0") - parseFloat(cs.paddingRight || "0"));
		const innerH = Math.max(0, el.clientHeight - parseFloat(cs.paddingTop || "0") - parseFloat(cs.paddingBottom || "0"));
		if (innerW <= 0 || innerH <= 0) return 4;

		const lineCount = asciiContent.trimEnd().split("\n").length;

		// Dynamic line-height for arts with many lines
		let lhRatio = 1.0;
		if (lineCount > 70) lhRatio = 0.85;
		else if (lineCount > 60) lhRatio = 0.9;
		else if (lineCount > 50) lhRatio = 0.95;
		this.asciiWindow.style.setProperty("--ascii-line-height", String(lhRatio));

		// Measure the widest line at reference size using pretext (cached per art)
		const ref = WindowManager.REF_FONT_SIZE;
		let prepared = this.pretextCache.get(asciiContent);
		if (!prepared) {
			prepared = prepareWithSegments(asciiContent, `${ref}px ${WindowManager.FONT_FAMILY}`, { whiteSpace: "pre-wrap" });
			this.pretextCache.set(asciiContent, prepared);
		}
		let widestLineAtRef = 0;
		walkLineRanges(prepared, 1e6, (line) => {
			if (line.width > widestLineAtRef) widestLineAtRef = line.width;
		});

		// Scale: at font size S, the widest line is (widestLineAtRef / ref) * S
		const widthPerPx = widestLineAtRef / ref;
		const fitWidth = innerW / Math.max(1, widthPerPx);
		const fitHeight = innerH / Math.max(1, lineCount * lhRatio);

		return Math.max(4, Math.min(maxPx, fitWidth, fitHeight));
	}

	/** Recalculate and apply ASCII font size (called on resize / container change). */
	private recalcAsciiFontSizeIfReady(): void {
		if (!this.asciiWindow || this.asciiWindow.style.display === "none") return;
		const asciiElement = this.asciiWindow.querySelector(".ascii-art") as HTMLElement | null;
		if (!asciiElement) return;
		const art = this.sizingArt || this.targetText || (asciiElement.textContent || "").trim();
		if (!art) return;
		const size = this.calculateOptimalFontSize(art, this.targetMaxPx);
		if (size > 0) {
			asciiElement.style.fontSize = `${size}px`;
		}
	}
}

// ============================
// APPLICATION INITIALIZATION
// ============================

document.addEventListener("DOMContentLoaded", () => {
	const manager = new WindowManager();
	(window as any).windowManager = manager;

	// Add some terminal-style loading text
	if (import.meta && (import.meta as any).env && (import.meta as any).env.DEV) {
		console.log(
			"%c[TERMINAL] Portfolio Initialized",
			"color: #FFA500; font-family: monospace;"
		);
	}
});


// Click handler for links within terminal-box pre content
document.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	// Let <a> tags work naturally; no special handling needed
	if (target.tagName === "A") return;
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
	if (e.altKey && !e.ctrlKey && !e.shiftKey) {
		switch (e.key) {
			case "1":
				e.preventDefault();
				const windowManager = (window as any).windowManager;
				if (windowManager) windowManager.openWindow("research");
				break;
		}
	}
});
