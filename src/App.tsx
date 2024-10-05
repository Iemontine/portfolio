import { useState } from "react";
import "./App.css";
import ContentBox from "./components/ContentBox";
import ArtBox from "./components/ArtBox";
import AboutBox from "./components/AboutBox";
import { BACKGROUND_COLOR, INTERFACE_COLOR } from "./constants";

const App = () => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="app-container">
      <div className="scanlines"></div>
      <div
        style={{ backgroundColor: BACKGROUND_COLOR, color: INTERFACE_COLOR }}
        className="h-screen w-screen text-xl p-4 sm:py-8 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto,auto,auto] md:grid-rows-[1fr,1fr] gap-4 sm:gap-4 vhs-effect">
        
        <AboutBox />

        <ContentBox />

        <div className="hidden md:block">
          <ArtBox currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default App;