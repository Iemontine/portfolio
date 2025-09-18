import "./style.css";
import { asciiArts, defaultAscii } from "./ascii-art";
import experienceHtml from "./content/experience.html?raw";
import researchHtml from "./content/research.html?raw";
import projectsHtml from "./content/projects.html?raw";
import contactHtml from "./content/contact.html?raw";

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

	// ASCII typing state (fixed-step)
	private targetText: string = "";
	private animationFrameId: number | null = null;
	private typingMode: "idle" | "deleting" | "typing" = "idle";
	private stepIndex: number = 0;
	private totalSteps: number = 0;
	private startText: string = "";
	private readonly deleteSteps: number = 100; // fewer steps -> quicker
	private readonly typeSteps: number = 128; // complete in ~24 frames
	private pendingFontSize: number | null = null;

	// Window state management for maximize/restore
	private originalWindowStates: Map<string, { width: string; height: string }>= new Map();

	// Shared maximization state for content windows (not About Me)
	private isContentWindowMaximized: boolean = true;

	// About Me window (independent)
	private aboutMeWindow: HTMLElement | null = null;

	// Cached character width per 1px of font size
	private charWidthPerPx: number | null = null;

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
	}

	private handleResize(): void {
		const isMobile = window.innerWidth <= 768;

		// Defer ASCII visibility to unified logic
		this.updateAsciiWindow();

		// Reset maximization state on mobile
		if (isMobile) {
			this.isContentWindowMaximized = false;
		}

		// Ensure About Me window is always visible on mobile
		if (isMobile && !this.aboutMeWindow) {
			this.showAboutMe();
		}

		// If About Me exists on desktop, recompute its layout based on state
		if (!isMobile && this.aboutMeWindow) {
			if (this.aboutMeWindow.dataset.maximized === "true") {
				this.layoutAboutMeMaximized();
			} else {
				this.layoutAboutMeDefault();
			}
		}
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
			// About Me should just toggle visibility, not interfere with content windows
			this.toggleAboutMe();
		});

		// Position it behind the About Me window on desktop, in grid on mobile
		const isMobile = window.innerWidth <= 768;
		if (!isMobile) {
			aboutIcon.style.position = "absolute";
			aboutIcon.style.bottom = "0px";
			aboutIcon.style.right = "0px";
			// No explicit z-index; desktop grid establishes order
		}

		const desktop = document.getElementById("desktop")!;
		desktop.appendChild(aboutIcon);
	}

	private getAboutMeContent(): string {
		return `
      <div class="terminal-text">
        <div class="system-header">lemontine [Version 2.025.917]</div>
        
        <div class="section">
          <div class="section-title">LEMONTINE</div>
          
          <div class="currents-section">
            <div class="currents-title">currents</div>
            <div class="current-item"><span class="status-watching">~Watching:</span> Apothecary Diaries</div>
            <div class="current-item"><span class="status-playing">~Playing:</span> Elden Ring: Nightreign, Hollow Knight</div>
            <div class="current-item"><span class="status-listening">~Listening to:</span> Cafune </div>
          </div>
          
          <div class="intro-text">I'm <span class="highlight-name">lemontine</span>, you might also know me as darroll!</div>
          
          <div class="about-section">
            <div class="about-title">about me</div>
            <div class="about-line"><span class="about-label">LEMONTINE:</span> Photos UI Engineer @ Apple. UC Davis CS Alumni, with a focus on machine learning and AI.</div>
            <div class="about-line"><span class="about-label">HOBBIES:</span> Programming, video games, video editing, computer building, and game development.</div>
            <div class="about-line"><span class="about-label">ENJOYS:</span> Learning about new technologies, AI ethics, travel, cosplay, and anime.</div>
            <div class="about-line"><span class="about-label">SPECS:</span> RTX 4070 and an AMD Ryzen 9 5900X.</div>
            
            <div class="favorites-section">
              <div class="about-label">FAVORITES:</div>
              <div class="about-line indent"><span class="fav-category">~Anime/TV/Movies:</span> Scott Pilgrim vs the World, Shaun of the Dead, Chainsaw Man, Dandadan</div>
              <div class="about-line indent"><span class="fav-category">~Video Games:</span> Minecraft, Portal 2, Team Fortress 2, Warframe, Zenless Zone Zero, Fortnite</div>
              <div class="about-line indent"><span class="fav-category">~Artists:</span> Jerma, Carpenter Brut, Ricky Montgomery, Good Kid, The Vanished People</div>
            </div>
            
            <div class="skills-line">
              proficient in <span class="skill-highlight">Python</span>, <span class="skill-highlight">Java</span>, <span class="skill-highlight">Typescript</span>, <span class="skill-highlight">C</span>, <span class="skill-highlight">C++</span>, <span class="skill-highlight">CSharp</span>, <span class="skill-highlight">HTML/Tailwind/CSS</span>, <span class="skill-highlight">VB.Net</span>, <span class="skill-highlight">Bash scripting</span>.
            </div>
            <div class="apis-line">
              favorite libraries/APIs: <span class="api-highlight">pytorch</span>, <span class="api-highlight">Microsoft Azure</span>, <span class="api-highlight">openai</span>, <span class="api-highlight">gymnasium</span>, <span class="api-highlight">pycord</span>, <span class="api-highlight">Pillow</span>, <span class="api-highlight">BeautifulSoup</span>
            </div>
          </div>
        </div>
      </div>
    `;
	}

	public openWindow(windowId: string): void {
		// Note: mobile vs desktop behavior is handled by Tailwind sizing; switching logic is identical

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
		// Create About Me window completely independently of the normal window system
		const windowContainer = document.getElementById("window-container")!;

		const aboutElement = document.createElement("div");
		// Absolute so it anchors to the inner bordered container
		aboutElement.className =
			"terminal-window about-window transition-all duration-300 ease-in-out";
		aboutElement.id = "about-me-window";

		// Apply consistent positioning and sizing to match ASCII art (relative to container)
		aboutElement.style.position = "absolute";
		aboutElement.style.bottom = "20px";
		aboutElement.style.right = "20px";
		// Size will be computed responsively below
	// layer handled by DOM order; no inline z-index

		aboutElement.innerHTML = `
      <div class="window-titlebar">
        <div class="window-controls">
          <div class="window-control close" data-action="close"></div>
          <div class="window-control minimize" data-action="minimize"></div>
          <div class="window-control maximize" data-action="maximize"></div>
        </div>
        <div class="window-title">Darroll Saddi - About Me</div>
      </div>
      <div class="window-content content-fade-in">
        ${this.getAboutMeContent()}
      </div>
    `;

		// Add window controls event listeners for About Me
		this.setupAboutMeControls(aboutElement);

		windowContainer.appendChild(aboutElement);
		this.aboutMeWindow = aboutElement; // Store separately from main windows

		// Apply a larger, responsive default layout on creation
		this.layoutAboutMeDefault();

		// Play enter animation and update ASCII
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

		const isCurrentlyMaximized =
			this.aboutMeWindow.dataset.maximized === "true";

		const el = this.aboutMeWindow;
		const first = el.getBoundingClientRect();
		const prevTransition = el.style.transition;
		const prevTransform = el.style.transform;
		const prevOrigin = el.style.transformOrigin;

		// Disable transitions while we set the target geometry
		el.style.transition = "none";
		el.style.transform = "none";
		el.style.transformOrigin = "bottom right";

		if (isCurrentlyMaximized) {
			// Apply restored responsive layout instantly
			this.layoutAboutMeDefault();
			el.dataset.maximized = "false";
		} else {
			// Apply maximized layout instantly (within right pane)
			this.layoutAboutMeMaximized();
			el.dataset.maximized = "true";
			this.bringAboutMeToFront();
		}

		// Measure the final geometry
		const last = el.getBoundingClientRect();

		// Compute FLIP deltas relative to bottom-right origin
		const scaleX = first.width ? first.width / last.width : 1;
		const scaleY = first.height ? first.height / last.height : 1;
		const translateX = (first.right - last.right) / 1; // px
		const translateY = (first.bottom - last.bottom) / 1; // px

		// Invert: start from old layout visually
		el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

		// Force reflow to apply the initial transform before animating
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		el.offsetWidth;

		// Animate to identity
		el.style.transition = "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)";
		el.style.transform = prevTransform || "none";

		const onTransitionEnd = () => {
			el.style.transition = prevTransition;
			el.style.transformOrigin = prevOrigin;
			el.removeEventListener("transitionend", onTransitionEnd);
		};
		el.addEventListener("transitionend", onTransitionEnd);
	}

	// Compute a maximized layout constrained to the right half of the inner container
	private layoutAboutMeMaximized(): void {
		if (!this.aboutMeWindow) return;
		const container = document.getElementById("window-container");
		const rect = container
			? container.getBoundingClientRect()
			: ({ width: window.innerWidth, height: window.innerHeight } as DOMRect);

		// Two-pane layout: width is half of inner area minus the 20px center gap and 20px side paddings (total 60px)
		const paneWidth = Math.floor(Math.max(0, rect.width - 60) / 2);
		// Height target: up to 60% of inner height, clamped to remain within margins and a sensible minimum
		const maxInnerHeight = Math.max(0, rect.height - 60);
		let targetHeight = Math.floor(rect.height * 0.6);
		targetHeight = Math.min(targetHeight, maxInnerHeight);
		targetHeight = Math.max(targetHeight, 260); // at least a bit larger than default 200px

		this.aboutMeWindow.style.width = `${paneWidth}px`;
		this.aboutMeWindow.style.minWidth = "";
		this.aboutMeWindow.style.maxWidth = "";
		this.aboutMeWindow.style.height = `${targetHeight}px`;
		this.aboutMeWindow.style.bottom = "20px";
		this.aboutMeWindow.style.right = "20px";
	}

	// Compute a larger default layout for About Me within the right pane
	private layoutAboutMeDefault(): void {
		if (!this.aboutMeWindow) return;
		const container = document.getElementById("window-container");
		const rect = container
			? container.getBoundingClientRect()
			: ({ width: window.innerWidth, height: window.innerHeight } as DOMRect);

		// Match right pane width; height ~45% of inner height, with sensible clamps
		const paneWidth = Math.floor(Math.max(0, rect.width - 60) / 2);
		const maxInnerHeight = Math.max(0, rect.height - 60);
		let targetHeight = Math.floor(rect.height * 0.45);
		targetHeight = Math.min(targetHeight, maxInnerHeight);
		targetHeight = Math.max(targetHeight, 320); // Larger than old 200px default

		this.aboutMeWindow.style.width = `${paneWidth}px`;
		this.aboutMeWindow.style.minWidth = "280px";
		this.aboutMeWindow.style.maxWidth = ""; // remove cap
		this.aboutMeWindow.style.height = `${targetHeight}px`;
		this.aboutMeWindow.style.bottom = "20px";
		this.aboutMeWindow.style.right = "20px";
	}

	private bringAboutMeToFront(): void {
		if (this.aboutMeWindow) {
			// layer handled by DOM order
		}
	}

	private getWindowConfig(windowId: string): WindowConfig | null {
		// Check if we're on mobile
		const isMobile = window.innerWidth <= 768;

		// Responsive dimensions
		const standardWidth = isMobile
			? Math.min(window.innerWidth - 20, 500)
			: 650;
		const standardHeight = isMobile
			? Math.min(window.innerHeight - 20, 600)
			: 500;

		const configs: Record<string, WindowConfig> = {
			research: {
				id: "research",
				title: "Research Projects",
				content: this.getResearchContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
			projects: {
				id: "projects",
				title: "Development Projects",
				content: this.getProjectsContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
			experience: {
				id: "experience",
				title: "Work Experience",
				content: this.getExperienceContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
			contact: {
				id: "contact",
				title: "Contact Information",
				content: this.getContactContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
		};

		return configs[windowId] || null;
	}

	private createWindow(config: WindowConfig): void {
		const windowContainer = document.getElementById("window-container")!;
		const isMobile = window.innerWidth <= 768;

		const windowElement = document.createElement("div");

		// Base classes with Tailwind positioning - responsive design for content windows only
		let baseClasses = `terminal-window transition-all duration-300 ease-in-out ${
			config.theme || "default"
		}`;

		if (isMobile) {
			// Mobile content windows - top positioning
			baseClasses +=
				" fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-20px)] max-w-[500px] h-[50vh] max-h-[400px]";
		} else {
			// Desktop content windows - center positioning
			baseClasses +=
				" fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
		}

		windowElement.className = baseClasses;
		windowElement.id = `window-${config.id}`;

		// Set responsive dimensions
		if (isMobile) {
			// Mobile dimensions are handled by Tailwind classes above
		} else {
			// Desktop dimensions
			if (config.width) windowElement.style.width = `${config.width}px`;
			if (config.height) windowElement.style.height = `${config.height}px`;

			// Check shared maximization state for all content windows
			if (this.isContentWindowMaximized && !isMobile) {
				// Start maximized: capture original state first so restore works
				this.originalWindowStates.set(config.id, {
					width: windowElement.style.width,
					height: windowElement.style.height,
				});
				// Apply maximized dimensions
				this.applyMaximizedState(windowElement, config);
				windowElement.dataset.maximized = "true";
			} else {
				// Start normal
				windowElement.dataset.maximized = "false";
			}
		}

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

		// Focus the window
		windowElement.addEventListener("mousedown", () => {
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
		const isMobile = window.innerWidth <= 768;

		// Don't maximize on mobile (About Me is separate and not in this system)
		if (windowElement && !isMobile) {
			const isCurrentlyMaximized = windowElement.dataset.maximized === "true";

			if (isCurrentlyMaximized) {
				// RESTORE: Window is currently maximized, restore to normal size
				const originalState = this.originalWindowStates.get(windowId);
				if (originalState) {
					windowElement.style.width = originalState.width;
					windowElement.style.height = originalState.height;
					// No z-index boost required; DOM order is used
				}

				// Update window state to non-maximized
				windowElement.dataset.maximized = "false";

				// Update shared state: ALL content windows should now open in normal size
				this.isContentWindowMaximized = false;
			} else {
				// MAXIMIZE: Window is currently normal, maximize it

				// Store current state before maximizing for restoration
				this.originalWindowStates.set(windowId, {
					width: windowElement.style.width,
					height: windowElement.style.height,
				});

				// Apply maximized dimensions (Tailwind handles centering)
				this.applyMaximizedState(windowElement);

				// Update window state to maximized
				windowElement.dataset.maximized = "true";

				// Update shared state: ALL content windows should now open maximized
				this.isContentWindowMaximized = true;
			}
		}
	}

	private applyMaximizedState(
		windowElement: HTMLElement,
		config?: WindowConfig
	): void {
		const isMobile = window.innerWidth <= 768;

		if (isMobile) {
			// On mobile, maximization is handled by CSS
			return;
		}

		// Desktop maximization: Just make window larger, Tailwind handles centering
		const standardWidth = config?.width || 650;
		const standardHeight = config?.height || 500;

		const newWidth = Math.floor(standardWidth * 1.3);
		const newHeight = Math.floor(standardHeight * 1.3);

		// Ensure the enlarged window fits within the viewport with some padding
		const maxWidth = window.innerWidth - 80;
		const maxHeight = window.innerHeight - 80;

		const finalWidth = Math.min(newWidth, maxWidth);
		const finalHeight = Math.min(newHeight, maxHeight);

		// Just set dimensions - Tailwind classes handle positioning
		windowElement.style.width = `${finalWidth}px`;
		windowElement.style.height = `${finalHeight}px`;

	// No z-index boost required; DOM order is used
	}

	// ============================
	// CONTENT METHODS
	// ============================

		private getResearchContent(): string {
				return researchHtml;
		}

		private getProjectsContent(): string {
				return projectsHtml;
		}

	private getExperienceContent(): string {
		return experienceHtml;
	}

		private getContactContent(): string {
				return contactHtml;
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
		const shouldShow =
			(hasContentWindow || aboutMeVisible) && window.innerWidth > 768;

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
					this.pendingFontSize = null;
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

		// Compute a dynamic line-height unless explicitly overridden elsewhere
		const asciiRoot = this.asciiWindow as HTMLElement;
		const overrideLh = asciiRoot.style.getPropertyValue("--ascii-line-height");
		if (!overrideLh) {
			const lines = asciiArt.trimEnd().split("\n").length || 1;
			let dyn = 1.0;
			if (lines > 70) dyn = 0.85;
			else if (lines > 60) dyn = 0.9;
			else if (lines > 50) dyn = 0.95;
			else dyn = 1.0;
			asciiRoot.style.setProperty("--ascii-line-height", String(dyn));
		}

		// Size from full art, then run a fixed-steps transition
		if (asciiElement) {
			const cap = activeWindowId === "about-me" ? 64 : 14;
			const size = this.calculateOptimalFontSize(asciiArt, cap);
			if (size > 0) {
				const current = asciiElement.textContent || "";
				// On first show (no content yet), apply immediately to avoid giant initial text
				if (!current.length) {
					asciiElement.style.fontSize = `${size}px`;
					this.pendingFontSize = null;
				} else if (this.typingMode === "idle" && current === asciiArt) {
					// If already showing the same art, apply immediately
					asciiElement.style.fontSize = `${size}px`;
					this.pendingFontSize = null;
				} else {
					// Defer until transition completes
					this.pendingFontSize = size;
				}
			}

			this.startTransition(asciiArt, asciiElement);
		}
	}

	private startTransition(nextText: string, asciiElement: HTMLElement): void {
		const current = asciiElement.textContent || "";
		// If nothing changed, keep whatever is on screen
		if (current === nextText) {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			this.typingMode = "idle";
			this.targetText = nextText;
			// Apply any deferred font-size change immediately
			if (this.pendingFontSize !== null) {
				asciiElement.style.fontSize = `${this.pendingFontSize}px`;
				this.pendingFontSize = null;
			}
			return;
		}

		// Prepare phases with common-prefix optimization
		this.targetText = nextText;
		const prefixLen = this.findCommonPrefix(current, nextText);
		const deleteLen = Math.max(0, current.length - prefixLen);
		const typeLen = Math.max(0, nextText.length - prefixLen);

		// Cancel any in-flight animation to start a fresh, deterministic sequence
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		const runTyping = () => {
			if (typeLen === 0) {
				// Nothing to type; finalize immediately
				asciiElement.textContent = this.targetText;
				this.typingMode = "idle";
				// Apply any pending font-size after transition completes
				if (this.pendingFontSize !== null) {
					asciiElement.style.fontSize = `${this.pendingFontSize}px`;
					this.pendingFontSize = null;
				}
				return;
			}

			this.typingMode = "typing";
			this.stepIndex = 0;
			this.totalSteps = this.typeSteps;
			let tProg = 0;
			const tInc = typeLen / this.totalSteps;
			const typeStep = () => {
				if (this.typingMode !== "typing") return;
				this.stepIndex++;
				tProg = Math.min(typeLen, tProg + tInc);
				if (this.stepIndex >= this.totalSteps) {
					// Ensure we land exactly on the target on the final step
					asciiElement.textContent = this.targetText;
					this.typingMode = "idle";
					this.animationFrameId = null;
					if (this.pendingFontSize !== null) {
						asciiElement.style.fontSize = `${this.pendingFontSize}px`;
						this.pendingFontSize = null;
					}
					return;
				}
				const typedCount = Math.floor(tProg);
				const nextShown = this.targetText.substring(0, prefixLen + typedCount);
				if ((asciiElement.textContent || "") !== nextShown) {
					asciiElement.textContent = nextShown;
				}
				this.animationFrameId = requestAnimationFrame(typeStep);
			};
			this.animationFrameId = requestAnimationFrame(typeStep);
		};

		if (deleteLen > 0) {
			// Delete only the differing suffix over exactly deleteSteps iterations
			this.typingMode = "deleting";
			this.startText = current;
			this.stepIndex = 0;
			this.totalSteps = this.deleteSteps;
			let dProg = 0;
			const dInc = deleteLen / this.totalSteps;
			const deleteStep = () => {
				if (this.typingMode !== "deleting") return;
				this.stepIndex++;
				dProg = Math.min(deleteLen, dProg + dInc);
				const deleted = Math.floor(dProg);
				const toKeep = Math.max(prefixLen, current.length - deleted);
				const shown = this.startText.substring(0, toKeep);
				if ((asciiElement.textContent || "") !== shown) {
					asciiElement.textContent = shown;
				}
				if (this.stepIndex >= this.totalSteps) {
					// Deletion finished. Apply any pending font-size right before typing new art
					if (this.pendingFontSize !== null) {
						asciiElement.style.fontSize = `${this.pendingFontSize}px`;
						this.pendingFontSize = null;
					}
					asciiElement.textContent = this.startText.substring(0, prefixLen);
					// proceed to typing
					runTyping();
					return;
				}
				this.animationFrameId = requestAnimationFrame(deleteStep);
			};
			this.animationFrameId = requestAnimationFrame(deleteStep);
		} else {
			// No deletion needed: apply font-size immediately if pending, then type
			if (this.pendingFontSize !== null) {
				asciiElement.style.fontSize = `${this.pendingFontSize}px`;
				this.pendingFontSize = null;
			}
			// Continue typing the remainder
			runTyping();
		}
	}

	private findCommonPrefix(a: string, b: string): number {
		const n = Math.min(a.length, b.length);
		let i = 0;
		while (i < n && a[i] === b[i]) i++;
		return i;
	}

	private calculateOptimalFontSize(
		asciiContent: string,
		maxPx: number = 14
	): number {
		if (!this.asciiWindow) return 10;
		// Prefer the content container to account for padding
		const contentEl = this.asciiWindow.querySelector(
			".ascii-content"
		) as HTMLElement | null;
		const measureEl = contentEl || this.asciiWindow;
		const cs = getComputedStyle(measureEl);
		const padL = parseFloat(cs.paddingLeft || "0");
		const padR = parseFloat(cs.paddingRight || "0");
		const padT = parseFloat(cs.paddingTop || "0");
		const padB = parseFloat(cs.paddingBottom || "0");
		const innerW = Math.max(0, measureEl.clientWidth - padL - padR);
		const innerH = Math.max(0, measureEl.clientHeight - padT - padB);

		// Parse ASCII content to get dimensions
		const lines = asciiContent.trimEnd().split("\n");
		const maxLineLength = lines.reduce((m, l) => Math.max(m, l.length), 0);
		const lineCount = lines.length;

		// Calculate font size based on container constraints
		// Character width ratio measured via probe for current font (fallback 0.6)
		const chPerPx = this.measureCharWidthPerPx(measureEl);
		// Derive dynamic line-height similar to previous ArtBox logic to fit height better
		let dynLineHeight = 0.7; // base fallback matching CSS
		if (lineCount > 70) dynLineHeight = 0.55;
		else if (lineCount > 60) dynLineHeight = 0.6;
		else if (lineCount > 50) dynLineHeight = 0.65;
		else if (lineCount > 40) dynLineHeight = 0.7;
		else dynLineHeight = 0.75;
		// Respect an explicit CSS override if present
		const lhVar = getComputedStyle(this.asciiWindow)
			.getPropertyValue("--ascii-line-height")
			.trim();
		const lineHeightRatio = lhVar ? parseFloat(lhVar) : dynLineHeight;
		// Subtract a small epsilon to ensure we never overflow width
		const epsilonW = 0.5;
		const epsilonH = 1.0;
		const fontSizeByWidth = Math.floor(
			(innerW - epsilonW) / Math.max(1, maxLineLength * chPerPx)
		);
		const fontSizeByHeight = Math.floor(
			(innerH - epsilonH) / Math.max(1, lineCount * lineHeightRatio)
		);

		// Use the smaller constraint to ensure everything fits
		const calculatedSize = Math.min(fontSizeByWidth, fontSizeByHeight);

		// Clamp between reasonable bounds (4px minimum, configurable maximum)
		return Math.max(4, Math.min(maxPx, calculatedSize));
	}

	// Recalculate ASCII font-size when visible and content exists; defer if typing
	private recalcAsciiFontSizeIfReady(): void {
		if (!this.asciiWindow || this.asciiWindow.style.display === "none") return;
		if ((this.asciiWindow as HTMLElement).style.visibility === "hidden") return;
		const asciiElement = this.asciiWindow.querySelector(".ascii-art") as HTMLElement | null;
		if (!asciiElement) return;
		const text = (asciiElement.textContent || "").trim();
		if (!text) return;
		const aboutVisible = !!(this.aboutMeWindow && this.aboutMeWindow.style.display !== "none");
		const activeId = this.currentContentWindow || (aboutVisible ? "about-me" : null);
		const size = this.calculateOptimalFontSize(this.targetText || text, activeId === "about-me" ? 64 : 14);
		if (size > 0) {
			if (this.typingMode === "idle") {
				asciiElement.style.fontSize = `${size}px`;
				this.pendingFontSize = null;
			} else {
				this.pendingFontSize = size;
			}
		}
	}

	private measureCharWidthPerPx(container: HTMLElement): number {
		if (this.charWidthPerPx && this.charWidthPerPx > 0)
			return this.charWidthPerPx;
		const probe = document.createElement("div");
		probe.style.position = "absolute";
		probe.style.visibility = "hidden";
		probe.style.whiteSpace = "nowrap";
		probe.style.left = "-9999px";
		probe.style.top = "0";
		probe.style.fontFamily = "MS UI Gothic, monospace";
		probe.style.fontSize = "100px";
		probe.style.lineHeight = "100px";
		probe.style.width = "1ch";
		probe.textContent = "0";
		container.appendChild(probe);
		const widthPx = probe.getBoundingClientRect().width || 60;
		probe.remove();
		const ratio = widthPx / 100; // px per 1px of font-size
		this.charWidthPerPx = ratio > 0 ? ratio : 0.6;
		return this.charWidthPerPx;
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


// Keyboard support for contact cards only
document.addEventListener("keydown", (e) => {
	const t = e.target as HTMLElement;
	if (!t || !t.matches('.contact-card.contact-action')) return;
	if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (t as HTMLElement).click(); }
});

// Contact card copy action (Discord): delegated click handler
document.addEventListener("click", async (e) => {
	const t = e.target as HTMLElement;
	const card = t.closest('.contact-card.contact-action') as HTMLElement | null;
	if (!card) return;
	const action = card.getAttribute('data-action');
	if (action !== 'copy') return;
	const sel = card.getAttribute('data-copy') || '';
	let text = '';
	if (sel) {
		const src = document.querySelector(sel) as HTMLElement | null;
		if (src) text = (src.textContent || '').trim();
	}
	if (!text) return;
	try {
		await navigator.clipboard.writeText(text);
		card.classList.add('copied');
		const hint = card.querySelector('.copy-hint') as HTMLElement | null;
		if (hint) {
			if (!(hint as any).dataset.origText) {
				(hint as any).dataset.origText = hint.textContent || 'Click to copy';
			}
			hint.textContent = 'Copied!';
		}
		setTimeout(() => {
			card.classList.remove('copied');
			const h = card.querySelector('.copy-hint') as HTMLElement | null;
			if (h) h.textContent = (h as any).dataset.origText || 'Click to copy';
		}, 1200);
	} catch (err) {
		// noop on failure
	}
});

// Clickable cards: open primary URL on click or keyboard
document.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	const card = target.closest(".card.clickable") as HTMLElement | null;
	if (!card) return;
	const url = card.getAttribute("data-url");
	if (url) window.open(url, "_blank", "noopener");
});

// Experience deck: expand/collapse sections and allow clicking header area
document.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	const header = target.closest(".xp-header") as HTMLElement | null;
	if (!header) return;
	const item = header.closest(".xp-item") as HTMLElement | null;
	if (!item) return;
	const open = item.getAttribute("data-open") === "true";
	// Smooth height animation by measuring scrollHeight
	const body = item.querySelector(".xp-body") as HTMLElement | null;
	if (body) {
		if (open) {
			body.style.maxHeight = body.scrollHeight + "px"; // set current so transition runs
			requestAnimationFrame(() => {
				item.setAttribute("data-open", "false");
				body.style.maxHeight = "0px";
			});
		} else {
			item.setAttribute("data-open", "true");
			const run = () => (body.style.maxHeight = body.scrollHeight + "px");
			requestAnimationFrame(run);
			setTimeout(() => (body.style.maxHeight = ""), 260);
		}
	} else {
		item.setAttribute("data-open", open ? "false" : "true");
	}
});

// Ripple origin tracking on experience cards and generic pond elements
document.addEventListener("pointermove", (e) => {
	const target = (e.target as HTMLElement).closest(".xp-item, .pond") as HTMLElement | null;
	if (!target) return;
	const rect = target.getBoundingClientRect();
	const x = ((e.clientX - rect.left) / rect.width) * 100;
	const y = ((e.clientY - rect.top) / rect.height) * 100;
	target.style.setProperty("--rip-x", x + "%");
	target.style.setProperty("--rip-y", y + "%");
});
document.addEventListener("pointerenter", (e) => {
	const target = (e.target as HTMLElement).closest(".xp-item, .pond") as HTMLElement | null;
	if (!target) return;
	const rect = target.getBoundingClientRect();
	const x = ((e.clientX - rect.left) / rect.width) * 100;
	const y = ((e.clientY - rect.top) / rect.height) * 100;
	target.style.setProperty("--rip-x", x + "%");
	target.style.setProperty("--rip-y", y + "%");
});

document.addEventListener("keydown", (e) => {
	const target = e.target as HTMLElement;
	if (!target || !target.classList || !target.classList.contains("clickable"))
		return;
	if (e.key === "Enter" || e.key === " ") {
		const url = target.getAttribute("data-url");
		if (url) {
			e.preventDefault();
			window.open(url, "_blank", "noopener");
		}
	}
});

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
	// Alt + number keys to open windows quickly
	if (e.altKey && !e.ctrlKey && !e.shiftKey) {
		switch (e.key) {
			case "1":
				e.preventDefault();
				const windowManager = (window as any).windowManager;
				if (windowManager) windowManager.openWindow("research");
				break;
			// Reserved keys can be added later
		}
	}
});

// Keyboard toggle for experience headers
document.addEventListener("keydown", (e) => {
	const target = e.target as HTMLElement;
	if (!target || !target.classList || !target.classList.contains("xp-header")) return;
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		(target as HTMLElement).click();
	}
});

// Expose instance via window.windowManager (set on DOMContentLoaded)
