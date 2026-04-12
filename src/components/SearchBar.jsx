import searchIcon from '/assets/search.png'; 
import React, { useState, useRef, useEffect } from 'react';
import './StarCards.css'

const SearchBar = () => {

    const [focus, setFocus] = useState(false)
    const [value, setValue] = useState("")
    const pulseRef = useRef(null)
    const twinkleRef = useRef(null)

    // мерцание ВСЕХ звёзд
    useEffect(() => {
        const startTwinkle = () => {
            if (!window.starsMesh) {
                setTimeout(startTwinkle, 500);
                return;
            }

            const sizes = window.starsMesh.geometry.attributes.aSize.array;
            const originalSizes = Float32Array.from(sizes); // сохраняем оригинальные размеры
            const phases = new Float32Array(sizes.length).map(() => Math.random() * Math.PI * 2); // случайная фаза для каждой звезды
            const speeds = new Float32Array(sizes.length).map(() => 0.02 + Math.random() * 0.04); // случайная скорость

            let frame = 0;
            twinkleRef.current = setInterval(() => {
                frame++;
                for (let i = 0; i < sizes.length; i++) {
                    const vmag = window.convertedStars?.[i]?.Vmag ?? 8;
                    const intensity = Math.min((vmag / 8) * 0.2, 0.2); // яркие звёзды (vmag<3) почти не мерцают
                    const flicker = 1 + intensity * Math.sin(frame * speeds[i] + phases[i]);
                    sizes[i] = originalSizes[i] * flicker;
                }
                window.starsMesh.geometry.attributes.aSize.needsUpdate = true;
            }, 50);
        };

        startTwinkle();

        return () => {
            if (twinkleRef.current) clearInterval(twinkleRef.current);
        };
    }, []);

    const handleSearch = () => {
        const stars = window.convertedStars;
        if (!stars) return;

        const found = stars.find(star => String(star.HIP) === value.trim());
        if (!found) { alert('The star is not found!'); return; }

        const scale = 3000;
        const tx = found.x * scale;
        const ty = found.y * scale;
        const tz = found.z * scale;

        window.controls.target.set(tx, ty, tz);
        window.camera.position.set(tx, ty, tz + 150);
        window.controls.update();
        window.showSearchRing(tx, ty, tz);

        setTimeout(() => {
            window.controls.target.set(0, 0, 100);
            window.controls.update();
        }, 3000);

    }

    return (
        <div className={`search-container ${focus ? 'focused' : ''}`}>
            <input className="search-input" type="text" placeholder="Search stars"
                value={value}
                onChange={e => setValue(e.target.value)}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
            />
            <button
                onClick={handleSearch}
                style={{ background: "none", padding: "0", border: "none", cursor: "pointer" }}>
                <img src={searchIcon} alt="searchIcon" className="search-icon" />
            </button>
        </div>
    );
};

export default SearchBar;