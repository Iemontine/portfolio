# Portal 2-themed Retro Terminal Portfolio

A modern, interactive portfolio website with a Portal 2-inspired retro terminal aesthetic, built with Vite + TypeScript and deployed to GitHub Pages.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-success?style=for-the-badge&logo=github)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## 🎮 Features

- **Retro Terminal Aesthetic**: Amber and green color scheme with CRT effects
- **Portal 2 Theming**: Blue and orange accent colors inspired by the game
- **Window Management**: macOS-style windows with minimize/maximize/close controls
- **Desktop Icons**: Click to open different portfolio sections
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: CSS transitions and window slide effects
- **Always-visible About Me**: Fixed information panel
- **CRT Effects**: Scanlines, glow effects, and terminal-style borders

## 🖥️ Sections

- **Research**: PPO Gameplaying AI, Video Content Description with LLM, Gamification of Education
- **Projects**: clembot, gmod_ultrakill_hud, GridGame, FloodFinder, softwareInstaller, misc.dev
- **Experience**: CODELAB AI Developer, UC Davis Library IT, Comfort Living, Monsters' Shift, STEM Club President
- **Contact**: Professional links, gaming handles, and contact information

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/darrollsaddi/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

### GitHub Pages (Recommended)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

1. **Fork or clone this repository**
2. **Enable GitHub Pages** in repository settings
3. **Push to main branch** - deployment happens automatically
4. **Visit your site** at `https://yourusername.github.io/portfolio`

### Manual Deployment

For manual deployment to GitHub Pages:

```bash
npm run deploy
```

This builds the project and pushes to the `gh-pages` branch.

### Other Hosting Platforms

The built `dist/` folder can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use `firebase deploy`
- **Surge**: Run `surge dist/`

## 🎨 Customization

### Colors

Edit the CSS variables in `src/style.css`:

```css
:root {
  --amber: #FFA500;
  --terminal-green: #00FF41;
  --portal-blue: #0099FF;
  --portal-orange: #FF6600;
  --dark-brown: #2B1810;
}
```

### Content

Update your portfolio content in `src/main.ts`:

- `getAboutMeContent()` - Personal information
- `getResearchContent()` - Research projects
- `getProjectsContent()` - Development projects  
- `getExperienceContent()` - Work experience
- `getContactContent()` - Contact information

### Window Themes

Three window themes are available:
- `default` - Amber borders
- `portal-blue` - Blue Portal gun theme
- `portal-orange` - Orange Portal gun theme

## 🛠️ Technical Details

### Architecture

- **Framework**: Vite + TypeScript for fast development and building
- **Styling**: Pure CSS with CSS Grid and Flexbox
- **Window System**: Custom JavaScript window manager
- **Icons**: Inline SVG masks for crisp rendering
- **Fonts**: JetBrains Mono for authentic terminal feel
- **Effects**: CSS animations and pseudo-elements for CRT simulation

### Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Performance

- Lightweight bundle (~50KB gzipped)
- No external dependencies at runtime
- Optimized CSS with efficient selectors
- Lazy-loaded window content

## 📱 Mobile Experience

- Responsive grid layout for desktop icons
- Touch-friendly window controls
- Optimized text sizes for mobile screens
- Simplified window management on small screens

## 🎯 Future Enhancements

- [ ] Draggable windows
- [ ] Terminal command interface
- [ ] Dark/light theme toggle
- [ ] Sound effects from Portal 2
- [ ] Window minimization to taskbar
- [ ] Keyboard shortcuts for power users

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Inspiration

Inspired by:
- Portal 2's clean, futuristic UI design
- Retro terminal aesthetics from the 80s and 90s
- Classic desktop operating systems
- The beauty of monospace typography

## 📞 Contact

**Darroll "Iemontine" Saddi**
- Email: dsaddi@ucdavis.edu
- LinkedIn: [linkedin.com/in/darroll-saddi](https://linkedin.com/in/darroll-saddi)
- GitHub: [github.com/darrollsaddi](https://github.com/darrollsaddi)

---

*"The cake may be a lie, but this portfolio is real."* - GLaDOS (probably)