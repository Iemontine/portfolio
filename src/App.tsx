import { useState } from "react";
import "./App.css";
import ContentBox from "./components/ContentBox";
import ArtBox from "./components/ArtBox";
import AboutBox from "./components/AboutBox";
import {  BACKGROUND_COLOR, INTERFACE_COLOR } from "./constants";

const App = () => {
	const [currentPage, setCurrentPage] = useState(0);

	return (
		<div className='app-container'>
			<div className='scanlines'></div>
			<div style={{ backgroundColor: BACKGROUND_COLOR, color: INTERFACE_COLOR }} className='h-screen w-screen text-xl px-8 py-8 grid grid-cols-[1fr,1fr] grid-rows-[1fr,1fr] gap-8 vhs-effect'>
				<ContentBox />

				<AboutBox />

				<ArtBox currentPage={currentPage} setCurrentPage={setCurrentPage} />
			</div>
		</div>
	);
};

export default App;
