import { useMemo } from "react";
import "./App.css";
import AsciiPanel from "./components/AsciiPanel";
import AboutBox from "./components/AboutBox";
import { sections } from "./data/portfolio";
import { INTERFACE_COLOR } from "./constants";
import { artPage0, artPage1, artPage2, artPage3, artPage4 } from "./ascii/art";

const artById: Record<string, string> = {
  header_research: artPage2,
  header_projects: artPage1,
  header_experience: artPage4,
  header_portfolio: artPage0,
  header_favorites: artPage3,
};

const Container = ({ children }: { children: React.ReactNode }) => (
  <div id="app-container" className="min-h-screen w-full" style={{ backgroundColor: "#000" }}>
    <div className="scanlines" />
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto" style={{ maxWidth: 980 }}>{children}</div>
    </main>
  </div>
);

const CardShell = ({ children, accent = INTERFACE_COLOR, className = "" }: { children: React.ReactNode; accent?: string; className?: string }) => (
  <div className={`border bg-black/90 backdrop-blur-[1px] shadow-[0_0_10px_rgba(79,174,155,0.15)] ${className}`}
       style={{ borderColor: accent }}>{children}</div>
);

const SectionCard = ({ id, title, accent, children, sideArt }: { id: string; title: string; accent: string; children: React.ReactNode; sideArt?: string }) => (
  <CardShell className="p-4 md:p-5 mb-6" accent={accent}>
    <div id={id} className="flex flex-col md:flex-row md:items-start gap-4">
      <div className="md:w-64 order-last md:order-first">
        {sideArt && <AsciiPanel ascii={sideArt} accent={accent} fitMode="width" />}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base md:text-xl mb-3" style={{ color: accent }}>{title}</h2>
        {children}
      </div>
    </div>
  </CardShell>
);

const Item = ({ title, subtitle, period, description, links = [], accent, image, tags = [] }: any) => (
  <div className="group border rounded-md p-3 md:p-4 mb-3 transition-colors" style={{ borderColor: accent }}>
    <div className="flex gap-3">
      {image && (
        <img src={image} alt={title} className="hidden md:block w-28 h-20 object-cover border" style={{ borderColor: accent }} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-sm md:text-base text-white">{title}</h3>
          {subtitle && <span className="text-xs text-gray-400">· {subtitle}</span>}
          {period && <span className="ml-auto text-[10px] text-gray-500">{period}</span>}
        </div>
        <p className="mt-1 text-xs md:text-sm text-gray-300">{description}</p>
        {!!links.length && (
          <div className="mt-2 flex flex-wrap gap-2">
            {links.map((l: any) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-[10px] md:text-xs no-underline hover:underline" style={{ color: accent }}>{l.label}</a>
            ))}
          </div>
        )}
        {!!tags.length && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t: string) => (
              <span key={t} className="text-[10px] px-1 border rounded" style={{ borderColor: accent, color: accent }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const App = () => {
  const artForSection = useMemo(() => artById, []);

  return (
    <Container>
      {/* Use the original AboutBox as a wider hero/header */}
      <div className="mx-auto mb-8 md:mb-10" style={{ maxWidth: 1100 }}>
        <AboutBox />
      </div>

      {/* Center column for content */}
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        {sections.map((s) => (
          <SectionCard key={s.id} id={s.id} title={s.title} accent={s.accent} sideArt={artForSection[s.id]}>
            {s.items.map((it) => (
              <Item key={it.title} {...it} accent={s.accent} />
            ))}
          </SectionCard>
        ))}
      </div>
    </Container>
  );
};

export default App;
