import { useState, useEffect } from "react";
import "./App.css";
import ContentBox from "./components/ContentBox";
import ArtBox from "./components/ArtBox";
import AboutBox from "./components/AboutBox";
import { INTERFACE_COLOR } from "./constants";

const App = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 900);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const renderBoxes = () => {
        if (isMobile) {
            return (
                <>
                    <AboutBox />
                    <ContentBox />
                </>
            );
        } else {
            return (
                <>
                    <ContentBox />
                    <AboutBox />
                </>
            );
        }
    };

    return (
        <div id="app-container">
            <div className='scanlines'></div>
            <div style={{ backgroundColor: '#001615', color: INTERFACE_COLOR }} className='h-screen w-screen text-xl p-4 sm:py-8 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto,auto,auto] md:grid-rows-[1fr,1fr] gap-4 sm:gap-4 vhs-effect'>
                {renderBoxes()}
                <ArtBox currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
        </div>
    );
};

export default App;
