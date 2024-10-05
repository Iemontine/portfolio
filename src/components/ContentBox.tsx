import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CONTENT,
  INTERFACE_COLOR,
  BACKGROUND_COLOR,
} from "../constants";

const FONT_SIZE = 15;
const LINE_HEIGHT = 1.5;
const CHARACTERS_PER_TICK = 2;  // Number of characters to reveal/hide per tick
const TICK_INTERVAL = 100;      // Duration of each tick in milliseconds

// TODO: add a typing effect, which was previously implemented but removed for accessibility concerns with old implementation
// Makes text within the ContentBox fade in or out based its visibility
const ContentBox: React.FC = () => {
  const contentBoxRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<number[]>([]);
  

  useEffect(() => {
    const contentBox = contentBoxRef.current;
    if (!contentBox) return;

    const sections = Array.from(contentBox.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisibleSections((prev) => [...prev, index]);
          } else {
            setVisibleSections((prev) =>
              prev.filter((sectionIndex) => sectionIndex !== index)
            );
          }
        });
      },
      {
        root: contentBox,
        threshold: 0.5,    // Trigger fade when 1% of the element is visible
      }
    );

    sections.forEach((section, index) => {
      section.setAttribute("data-index", index.toString());
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={contentBoxRef}
      style={{
        borderColor: INTERFACE_COLOR,
        backgroundColor: BACKGROUND_COLOR,
        fontSize: `${FONT_SIZE}px`,
        lineHeight: `${LINE_HEIGHT}`,
        overflowY: "auto",
        height: "100%",
        
      }}
      className="row-span-2 border p-8 z-20 h-full "
    >
      {CONTENT.split("<br>").map((section, index) => (
        <div
          key={index}
          data-index={index}
          style={{
            opacity: visibleSections.includes(index) ? 1 : 0,
            color: 'white',
            transition: "opacity 1s ease",
            willChange: "opacity",
          }}
          dangerouslySetInnerHTML={{ __html: section }}
        />
      ))}
    </div>
  );
};

export default ContentBox;