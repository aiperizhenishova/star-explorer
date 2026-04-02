import searchIcon from '/assets/search.png'; 
import React, { useState } from 'react';
import './StarCards.css'
import Background from 'three/src/renderers/common/Background.js';

const SearchBar = () => {

    const [focus, setFocus] = useState(false)
    const [value, setValue] = useState("")

    const handleSearch = () =>{
        const stars = window.convertedStars;
        if(!stars) return;
        

        const found = stars.find(star => String(star.HIP) === value.trim());
        if(!found) {alert('The star is not found!'); return}   // return останавливает код

        const scale = 3000;
        window.controls.target.set(found.x * scale, found.y * scale, found.z * scale);
        window.camera.position.set(found.x * scale, found.y * scale, found.z * scale + 200);
        window.controls.update();
        window.showSearchRing(found.x * scale, found.y * scale, found.z * scale);
        

        const index = stars.indexOf(found);
        // window.StarDistanceUtils_highlight = index;

        const sizes = window.starsMesh.geometry.attributes.aSize.array;
        // sizes[index] *= 4;
        // window.starsMesh.geometry.attributes.aSize.needsUpdate = true;

        const originalSize = found.Size;

        if(pulseRef.current) clearInterval(pulseRef.current);

        let growing = true;
        pulseRef.current = setInterval(() => {
            const sizes = window.starsMesh.geometry.attributes.aSize.array;
            if(growing){
                sizes[index] *= 1.05;
            }else{
                sizes[index] *= 0.95;
            }
            if(sizes[index] > found.Size * 12) growing = false;
            if(sizes[index] < found.Size * 8) growing = true;
            window.starsMesh.geometry.attributes.aSize.needsUpdate = true;
        }, 50);

    }

    return(
        <div className= {`search-container ${focus ? 'focused' : ''}`}>
                <input className= "search-input" type="text" placeholder="Search stars"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                /> 
                <button 
                    onClick={handleSearch}
                    style={{background: "none", padding:"0", border:"none", cursor:"pointer"}}>
                        <img src={searchIcon} alt="searchIcon" className="search-icon" />
                </button> 
                

        </div>
    );
};

export default SearchBar;