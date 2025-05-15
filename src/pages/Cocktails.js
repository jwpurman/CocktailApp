import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Cocktails = () => {
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difyLoading, setDifyLoading] = useState(false);
  const [difyTextResponse, setDifyTextResponse] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();


  const fetchDifyResponse = useCallback(async (cocktailName) => {
    setDifyLoading(true);
    try {
      const response = await axios.post(
        'https://api.dify.ai/v1/workflows/run',
        {
          inputs: { Cocktail: cocktailName },
          response_mode: 'blocking',
          user: 'abc-123'
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_DIFY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const recipeStr = response.data?.data?.outputs?.Recipe;
      console.log('Recipe data:', recipeStr);
      
      if (!recipeStr) {
        setDifyTextResponse({
          name: cocktailName || 'Error',
          category: 'Error',
          instructions: { en: 'No recipe was found. Please try again.' },
          ingredients: [],
          tags: []
        });
        return [];
      }

      try {
        // Parse the JSON string into an object
        const recipe = JSON.parse(recipeStr);
        console.log('Parsed recipe:', recipe);

        // Format the recipe data for display
        setDifyTextResponse({
          name: recipe.recipe_name || cocktailName || 'Custom Cocktail',
          category: recipe.keywords?.[0] || 'AI Generated Recipe',
          instructions: {
            en: recipe.instructions.join('\n'),
            description: recipe.description
          },
          ingredients: recipe.ingredients.map(ingredient => ({ ingredient })),
          tags: recipe.keywords || [],
          metadata: {
            'Serving Size': recipe.serving_size,
            'Prep Time': recipe.prep_time,
            'Chill Time': recipe.chill_time
          }
        });
      } catch (parseError) {
        console.error('Error parsing recipe JSON:', parseError);
        console.error('Raw recipe string:', recipeStr);
        setDifyTextResponse({
          name: cocktailName || 'Error',
          category: 'Error',
          instructions: { en: 'Failed to parse recipe data. Please try again.' },
          ingredients: [],
          tags: []
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setDifyTextResponse({
        name: cocktailName || 'Error',
        category: 'Error',
        instructions: { en: 'Failed to fetch recipe. Please try again.' },
        ingredients: [],
        tags: []
      });
      return [];
    } finally {
      setDifyLoading(false);
    }
  }, []);

  const fetchCocktails = useCallback(async () => {
    const params = new URLSearchParams(location.search);
    const searchTerm = params.get('search');
    const spirit = params.get('spirit');

    if (!searchTerm && !spirit) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);
    setDifyTextResponse(null);
    try {
      let response;
      if (searchTerm) {
        // First try CocktailDB
        response = await axios.get(
          `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`
        );
        let drinks = response.data.drinks || [];

        // If no results, try Dify API
        if (drinks.length === 0) {
          console.log('No drinks found in CocktailDB, trying Dify API...');
          const difyResults = await fetchDifyResponse(searchTerm);
          console.log('Received Dify results:', difyResults);
          drinks = difyResults;
        }

        console.log('Setting cocktails state with:', drinks);
        setCocktails(drinks || []);
      } else if (spirit) {
        response = await axios.get(
          `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${spirit}`
        );
        setCocktails(response.data.drinks || []);
      }
    } catch (error) {
      console.error('Error fetching cocktail details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to fetch cocktails. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location.search, navigate, fetchDifyResponse]);

  useEffect(() => {
    fetchCocktails();
  }, [fetchCocktails]);

  const handleCocktailClick = useCallback((cocktail) => {
    navigate(`/cocktail/${cocktail.idDrink}`);
  }, [navigate]);

  const renderCocktails = () => {
    if (cocktails.length === 0 && !difyTextResponse && !loading && !difyLoading) {
      return <div className="no-results">No cocktails found</div>;
    }

    return (
      <div className="cocktails-grid">
        {cocktails.map((cocktail) => (
          <div
            key={cocktail.idDrink}
            className="cocktail-card"
            onClick={() => handleCocktailClick(cocktail)}
          >
            <img
              src={cocktail.strDrinkThumb}
              alt={cocktail.strDrink}
              className="cocktail-image"
            />
            <div className="cocktail-info">
              <h3 className="cocktail-name">{cocktail.strDrink}</h3>
              {cocktail.strCategory && (
                <p className="cocktail-category">{cocktail.strCategory}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
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
        <h2 className="text-4xl font-bold mb-6 text-white">Search Results</h2>
        {error && (
          <div className="bg-black bg-opacity-50 text-red-400 px-6 py-4 rounded-lg shadow-lg relative mb-6 border border-red-500" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {(loading || difyLoading) && (
          <div className="text-center">
            <div className="text-2xl text-white">
              {difyLoading ? 'Crafting your cocktail recipe...' : 'Loading...'}
            </div>
          </div>
        )}
        {difyTextResponse && !loading && !difyLoading && (
          <div className="bg-black bg-opacity-50 rounded-lg shadow-lg p-8 mb-6 backdrop-blur-sm border border-gray-700">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-white mb-4">{difyTextResponse.name}</h1>
              <p className="text-gray-100">{difyTextResponse.category}</p>
              {difyTextResponse.instructions.description && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4 text-white">Description</h2>
                  <p className="text-gray-100 whitespace-pre-line leading-relaxed">{difyTextResponse.instructions.description}</p>
                </div>
              )}
            </div>
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Ingredients</h2>
              <ul className="space-y-2">
                {difyTextResponse.ingredients.map((item, index) => (
                  <li key={index} className="text-gray-100">{item.ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Instructions</h2>
              <ol className="space-y-3">
                {difyTextResponse.instructions.en.split('\n').map((instruction, index) => (
                  <li key={index} className="text-gray-100">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
            {Object.entries(difyTextResponse.metadata).some(([_, value]) => value) && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-white">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(difyTextResponse.metadata).map(([key, value]) => (
                    value && (
                      <div key={key} className="bg-black bg-opacity-30 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-200">{key}</h3>
                        <p className="text-gray-100 mt-1">{value}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {renderCocktails()}
      </div>
    </div>
  );
};

export default Cocktails;
