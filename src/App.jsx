import React from 'react';
import SearchBar from './components/searchBar';
import './style.css';
import './components/StarCards.css';


function App() {
    return (
        <div className="app-container">
            <div className='top-ui'>
                <SearchBar/>
            </div>
            
        </div>
    );
};

export default App;