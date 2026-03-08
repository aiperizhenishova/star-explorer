import React from 'react';
import SearchBar from './components/searchBar';
import StarCard from './components/starCard'

import './style.css';
import './components/StarCards.css';


function App() {
    return (
        <div className="app-container">
            <div className="background-stars">

            </div>

            {/*поиск */}
            <div className="top-ui">
                <SearchBar />
            </div>

            <StarCard
                id = "222"
                magnitude = "7.03"
                distance = "200"
            />
        </div>
    );
};

export default App;