import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cocktails from './pages/Cocktails';
import CocktailDetail from './pages/CocktailDetail';
import './App.css';
import './styles/Cocktails.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cocktails" element={<Cocktails />} />
            <Route path="/cocktail/:id" element={<CocktailDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
