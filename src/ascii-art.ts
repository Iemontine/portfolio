// ASCII Art Collection for Portfolio Windows
// Edit these strings to customize the ASCII art for each window

export const asciiArts: Record<string, string> = {
  'about-me': `
╭─────────────────╮
│   ◉     ◉   │
│       ω       │
│   \\___________/   │
╰─────────────────╯
  lemontine.exe
`,

  'research': `
┌─────────────────┐
│ ▲ ▲ ▲ ▲ ▲ ▲ ▲ │
│ █ █ █ █ █ █ █ │  
│ ▼ ▼ ▼ ▼ ▼ ▼ ▼ │
└─────────────────┘
   [RESEARCH]
`,

  'projects': `
╔═══════════════════╗
║ ░▒▓█ CODE █▓▒░ ║
║    </>  </>     ║
║  {function()}   ║  
║    return 42;    ║
╚═══════════════════╝
   [PROJECTS]
`,

  'experience': `
┏━━━━━━━━━━━━━━━━━━━┓
┃ ⚙  EXPERIENCE ⚙ ┃
┃                 ┃
┃  █▄─▄█─▄█▄─▄█   ┃
┃  ─▀─▀▀─▀▀▀─▀─   ┃
┗━━━━━━━━━━━━━━━━━━━┛
    [WORK HISTORY]
`,

  'contact': `
╭─────────────────╮
│    📧 @ 📞    │
│   ┌─────────┐   │
│   │ CONTACT │   │
│   └─────────┘   │  
│    🌐 💬 📨    │
╰─────────────────╯
   [GET IN TOUCH]
`
};

// Default fallback ASCII art
export const defaultAscii = asciiArts['about-me'];