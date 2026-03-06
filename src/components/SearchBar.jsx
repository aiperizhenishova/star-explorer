import searchIcon from '../../assets/search.png';
import React from 'react';

const SearchBar = () => {
    return(
        <div className="search-container">
            <div className="search-box">
                <img src={searchIcon} alt="searchIcon" className="search-icon" />
                <input type="text" placeholder='Search stars'/>
            </div>
        </div>
    );
};

export default SearchBar;