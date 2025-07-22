import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import UrlShortner from './assets/components/UrlShortner'

function App() {
  const [count, setCount] = useState(0)

  return (
    <UrlShortner/>
  )
}

export default App
