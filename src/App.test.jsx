import React from 'react'
import {render, screen} from '@testing-library/react'
import {vi} from 'vitest'
import App from './App'

vi.mock('/assets/search.png', ()=> ({default: ''}))
vi.mock('three/src/renderers/common/Background.js', ()=> ({default: {} }))

import SearchBar from './components/SearchBar'

test('app renders without crashing', ()=> {
    render(<SearchBar />)
    expect(document.body).toBeTruthy()
})