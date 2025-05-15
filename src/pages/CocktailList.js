import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { getMlRecommendations } from '../services/mlApi';

const CocktailList = () => {
  const [cocktails, setCocktails] = useState([]);
  const [mlRecommendations, setMlRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const spiritQuery = searchParams.get('spirit');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (spiritQuery) {
          response = await axios.get(
            `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${spiritQuery}`
          );
          // Get ML recommendations based on the spirit
          const mlRecs = await getMlRecommendations([spiritQuery]);
          setMlRecommendations(mlRecs);
        } else {
          response = await axios.get(
            `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchQuery || ''}`
          );
          // For cocktail search, we'll get recommendations based on its main ingredient
          if (response.data.drinks && response.data.drinks.length > 0) {
            const mainIngredient = response.data.drinks[0].strIngredient1;
            const mlRecs = await getMlRecommendations([mainIngredient]);
            setMlRecommendations(mlRecs);
          }
        }
        setCocktails(response.data.drinks || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, spiritQuery]);

  if (loading) {
    return (
      <div className="results-container">
        <Link to="/" className="home-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          Home
        </Link>
        <div className="results-content">
          <div className="text-center">
            <div className="text-2xl text-white">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (cocktails.length === 0) {
    return (
      <div className="results-container">
        <Link to="/" className="home-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          Home
        </Link>
        <div className="results-content">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">No cocktails found</h2>
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              Try another search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <Link to="/" className="home-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
        Home
      </Link>
      <div className="results-content">
        <h2 className="text-3xl font-bold mb-6 text-white">
          {spiritQuery 
            ? `Cocktails with ${spiritQuery}`
            : searchQuery
            ? `Search Results for "${searchQuery}"`
            : 'All Cocktails'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cocktails.map((cocktail) => (
            <Link
              key={cocktail.idDrink}
              to={`/cocktail/${cocktail.idDrink}`}
              className="block bg-black bg-opacity-50 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm border border-gray-700"
            >
              <img
                src={cocktail.strDrinkThumb}
                alt={cocktail.strDrink}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white">{cocktail.strDrink}</h3>
                {cocktail.strCategory && (
                  <p className="text-gray-300">{cocktail.strCategory}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {mlRecommendations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6 text-white">AI Recommended Cocktails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mlRecommendations.map((cocktail, index) => (
                <div
                  key={index}
                  className="block bg-black bg-opacity-50 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm border border-gray-700"
                >
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{cocktail.name}</h3>
                    <p className="text-gray-300 mb-2">
                      Similarity: {(cocktail.similarity * 100).toFixed(1)}%
                    </p>
                    <h4 className="text-white font-medium mb-1">Ingredients:</h4>
                    <ul className="text-gray-300 mb-3">
                      {cocktail.ingredients.map((ing, i) => (
                        <li key={i}>{cocktail.measures[i]} {ing}</li>
                      ))}
                    </ul>
                    <h4 className="text-white font-medium mb-1">Instructions:</h4>
                    <p className="text-gray-300">{cocktail.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CocktailList;
