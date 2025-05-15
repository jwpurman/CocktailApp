import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('cocktail');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difyLoading, setDifyLoading] = useState(false);
  const [difyResponse, setDifyResponse] = useState(null);
  const navigate = useNavigate();

  const fetchDifyResponse = async (cocktailName) => {
    setDifyLoading(true);
    try {
      // Start the workflow
      const response = await axios.post(
        'https://api.dify.ai/v1/workflows/run',
        {
          inputs: { Cocktail: cocktailName },
          response_mode: 'blocking',
          user: 'abc-123'
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_DIFY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('Dify API Response:', response.data);
      
      // For blocking mode, we should get the result directly
      if (response.data?.data?.outputs?.data) {
        try {
          const parsedData = JSON.parse(response.data.data.outputs.data);
          console.log('Parsed Dify data:', parsedData);
          const cocktailData = parsedData[cocktailName]?.drinks?.[0];
          setDifyResponse(cocktailData || null);
          return cocktailData || null;
        } catch (parseError) {
          console.error('Error parsing Dify response:', parseError);
          setDifyResponse(null);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching from Dify:', error);
      setDifyResponse(null);
      return null;
    } finally {
      setDifyLoading(false);
    }
  };

  const fetchResults = async (searchQuery) => {
    if (!searchQuery.trim() || searchType !== 'cocktail') {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchQuery}`
      );
      const drinks = response.data.drinks || [];
      setSuggestions(drinks);
      
      if (!drinks.length && searchQuery.trim()) {
        console.log('No drinks found in CocktailDB, trying Dify API...');
        const difyResult = await fetchDifyResponse(searchQuery);
        console.log('Dify API result:', difyResult);
        if (difyResult) {
          setDifyResponse(difyResult);
        }
      } else {
        setDifyResponse(null);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (searchType === 'cocktail') {
        navigate(`/cocktails?search=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        navigate(`/cocktails?spirit=${encodeURIComponent(searchTerm.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (cocktail) => {
    navigate(`/cocktail/${cocktail.idDrink}`);
  };

  return (
    <div className="home-container">
      <div className="search-container">
        <h1 className="text-4xl font-bold mb-6 text-white">Find Your Perfect Cocktail</h1>
        
        <div className="search-type-buttons">
          <button
            type="button"
            className={`search-type-button ${searchType === 'cocktail' ? 'active' : ''}`}
            onClick={() => {
              setSearchType('cocktail');
              setSearchTerm('');
              setSuggestions([]);
            }}
          >
            Search by Cocktail
          </button>
          <button
            type="button"
            className={`search-type-button ${searchType === 'spirit' ? 'active' : ''}`}
            onClick={() => {
              setSearchType('spirit');
              setSearchTerm('');
              setSuggestions([]);
            }}
          >
            Search by Spirit
          </button>
        </div>

        <form onSubmit={handleSearch}>
          <div className="search-wrapper">
            <input
                type="text"
                className="search-input"
                placeholder={searchType === 'cocktail' ? "Search for cocktails..." : "Enter a spirit (e.g., Vodka, Gin, Rum)..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
            />
          </div>
          <button type="submit" className="search-button">
            {searchType === 'cocktail' ? 'Search Cocktails' : 'Find Cocktails by Spirit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
