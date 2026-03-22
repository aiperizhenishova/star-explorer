import React from "react";
import { useState } from "react";
import { div } from "three/tsl";

const BottomNav = () =>{
    const [active, setActive] = useState('home')

    return(
        <div className="bottom-nav">
            <button
                className={'nav-item ${active === `home` ? `active` : ``}'}
                onClick={() => setActive('home')}>
                    <span>Home</span>
            </button>


            <button
                className={'nav-item ${active === `constellations` ? `active` : ``}'}
                onClick={() => {
                    setActive('constellations');
                    window.toggleConstellations();
                }}>
                    <span>Constellations</span>
            </button>


            <button
                className={'nav-item ${active === `hideshow` ? `active` : ``}'}
                onClick={() => setActive('hideshow')}>
                    <span>Hide/Show</span>
            </button>

        </div>
    
    )
}

export default BottomNav;