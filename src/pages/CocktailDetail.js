import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CocktailDetail = () => {
  const [cocktail, setCocktail] = useState(null);
  const [relatedCocktails, setRelatedCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchCocktailDetails = async () => {
      try {
        const response = await axios.get(
          `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        const cocktailData = response.data.drinks[0];
        setCocktail(cocktailData);

        // Fetch related cocktails by first spirit
        const mainSpirit = cocktailData.strIngredient1;
        if (mainSpirit) {
          const relatedResponse = await axios.get(
            `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${mainSpirit}`
          );
          // Filter out the current cocktail and get up to 6 related cocktails
          const filteredCocktails = relatedResponse.data.drinks
            .filter(drink => drink.idDrink !== id)
            .slice(0, 6);
          setRelatedCocktails(filteredCocktails);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cocktail details:', error);
        setLoading(false);
      }
    };

    fetchCocktailDetails();
  }, [id]);

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

  if (!cocktail) {
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
            <h2 className="text-2xl font-bold mb-4 text-white">Cocktail not found</h2>
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              Return to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getIngredients = () => {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`];
      const measure = cocktail[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push({
          ingredient,
          measure: measure || 'To taste'
        });
      }
    }
    return ingredients;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <img
              src={cocktail.strDrinkThumb}
              alt={cocktail.strDrink}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4 text-white">{cocktail.strDrink}</h1>
            <p className="text-gray-300 mb-6">{cocktail.strCategory}</p>
            
            <h2 className="text-2xl font-semibold mb-4 text-white">Ingredients</h2>
            <ul className="mb-6">
              {getIngredients().map(({ ingredient, measure }, index) => (
                <li key={index} className="text-gray-300 mb-2">
                  <span className="font-medium">{measure}</span> {ingredient}
                </li>
              ))}
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4 text-white">Instructions</h2>
            <p className="text-gray-300 mb-6">{cocktail.strInstructions}</p>
            
            {cocktail.strGlass && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">Recommended Glass</h2>
                <p className="text-gray-300">{cocktail.strGlass}</p>
              </div>
            )}
          </div>
        </div>

        {relatedCocktails.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-white">
              More Cocktails with {cocktail.strIngredient1}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCocktails.map((relatedCocktail) => (
                <Link
                  key={relatedCocktail.idDrink}
                  to={`/cocktail/${relatedCocktail.idDrink}`}
                  className="block bg-black bg-opacity-50 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm border border-gray-700"
                >
                  <img
                    src={relatedCocktail.strDrinkThumb}
                    alt={relatedCocktail.strDrink}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white">{relatedCocktail.strDrink}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CocktailDetail;
