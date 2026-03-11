import React from 'react';
import SearchBar from './components/SearchBar';
import './style.css';
// import './components/StarCards.css';


function App() {
    return (
        <div className="app-container">
            <div className='textContent'>
                <img id='logo' src="assets\orbit-logo.svg" alt="logo"/>
                <h1 id='text'>Star Explorer</h1>
            </div>
            
            <div className='top-ui'>
                <SearchBar/>
            </div>
            
        </div>
    );
};

export default App;