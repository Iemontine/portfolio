import React, { useState } from 'react';
import './App.css';
import ContentBox from './components/ContentBox';
import ArtBox from './components/ArtBox';
import { PAGE_CONTENT, BACKGROUND_COLOR, INTERFACE_COLOR } from './constants';

const App = () => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div style={{ backgroundColor: BACKGROUND_COLOR, color: INTERFACE_COLOR }} className="h-screen w-screen text-xl px-8 py-8 grid grid-cols-[auto,1fr,1fr] grid-rows-[1fr,1fr] gap-8">
      <div className="row-span-2 flex flex-col justify-center items-center space-y-2">
        {PAGE_CONTENT.map((page, index) => (
          <div
            key={page.id}
            style={{ borderColor: INTERFACE_COLOR, backgroundColor: index === currentPage ? INTERFACE_COLOR : 'transparent' }}
            className="h-12 w-4 border transition-all duration-300 ease-in-out"
          />
        ))}
      </div>

      <ContentBox currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* LEMONTINE box */}
      <div style={{ borderColor: INTERFACE_COLOR }} className="relative border p-4 z-10">
        <div className="relative z-20">
          <span className="text-2xl">LEMONTINE</span>
          <p>some simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me text</p>
        </div>
        {/* Absolute-positioned boxes (overlapping the LEMONTINE box) */}
        <div className="absolute right-0 top-0 flex space-x-4 z-10">
            <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: 'translate(-10px, -10px)' }} className="border p-2 h-32 w-64">
            <p>will be filled with animated/panning text eventually, or images</p>
            </div>
            <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: 'translate(-10px, -10px)' }} className="h-32 w-16 border"></div>
            <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: 'translate(-10px, -10px)' }} className="h-32 w-40 border"></div>
        </div>
      </div>

      {/* Absolute-positioned boxes (overlapping the LEMONTINE box) */}


      <ArtBox currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {/* <div style={{ borderColor: INTERFACE_COLOR }} className="border p-4">
        <p>ascii art to go here</p>
      </div> */}
    </div>
  );
};

export default App;