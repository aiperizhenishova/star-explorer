import searchIcon from '../../assets/search.png';
import React, { useState } from 'react';
import './StarCards.css'
import Background from 'three/src/renderers/common/Background.js';

const SearchBar = () => {

    const [focus, setFocus] = useState(false)
    const [value, setValue] = useState("")

    return(
        <div className="search-container" 
            style={{background:focus ? "rgba(255, 255, 255, 0.18)" :  "rgba(255, 255, 255, 0.12)",
                    boxShadow: focus ? "0 0 0 1px rgba(255, 255, 255, 0.3" : "none",
            }}>
                <img src={searchIcon} alt="searchIcon" className="search-icon" />
                <input className= "search-input" type="text" placeholder="Search stars"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                />  
        </div>
    );
};

export default SearchBar;