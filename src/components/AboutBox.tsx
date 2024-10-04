import React from 'react';
import { INTERFACE_COLOR, BACKGROUND_COLOR } from '../constants';

const CustomComponent: React.FC = () => {
  return (
    <div style={{ borderColor: INTERFACE_COLOR }} className='relative border p-4'>
      <div className='relative z-20'>
        <span className='text-2xl' data-text='LEMONTINE'>
          LEMONTINE
        </span>
        <p>some simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me textsome simple about me text</p>
      </div>
      {/* Absolute-positioned boxes (overlapping the LEMONTINE box) */}
      <div className='absolute right-0 top-0 flex space-x-4 z-10'>
        <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)" }} className='border p-2 h-32 w-64'>
          <p>TBA</p>
        </div>
        <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)" }} className='h-32 w-16 border'></div>
        <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)" }} className='h-32 w-40 border'></div>
      </div>
    </div>
  );
};

export default CustomComponent;