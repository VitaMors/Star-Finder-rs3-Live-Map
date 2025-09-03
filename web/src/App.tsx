import React from 'react'
import StarMap from './components/StarMap'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <h1 className="text-2xl font-bold text-center">RS3 Shooting Star Live Map</h1>
        <p className="text-slate-400 text-center mt-1">Track shooting stars across RuneScape 3 worlds</p>
      </header>
      <main className="container mx-auto p-4">
        <StarMap />
      </main>
    </div>
  )
}

export default App
