import axios from 'axios';

const ML_API_URL = 'http://localhost:5000/api';

export const getMlRecommendations = async (ingredients) => {
  try {
    const response = await axios.post(`${ML_API_URL}/recommendations`, {
      ingredients: ingredients
    });
    return response.data.recommendations;
  } catch (error) {
    console.error('Error getting ML recommendations:', error);
    return [];
  }
};
