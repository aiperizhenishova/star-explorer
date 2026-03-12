import searchIcon from '/assets/search.png'; 
import React, { useState } from 'react';
import './StarCards.css'
import Background from 'three/src/renderers/common/Background.js';

const SearchBar = () => {

    const [focus, setFocus] = useState(false)
    const [value, setValue] = useState("")

    const handleSearch = () =>{
        const stars = window.convertedStars;
        console.log('stars: ', stars)
        console.log('value: ', value)
        if(!stars) return;
        

        const found = stars.find(star => String(star.HIP) === value.trim());
        console.log('found star: ', found)
        if(!found) {alert('The star is not found!'); return}   // return останавливает код

        window.controls.target.set(found.x, found.y, found.z);
        window.camera.position.set(found.x, found.y, found.z + 500);
        window.controls.update();

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