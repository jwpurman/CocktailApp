# Cocktail App

A modern web application for discovering and exploring cocktail recipes, featuring both traditional recipes from CocktailDB and AI-generated custom recipes using Dify AI.

## Features
- Browse traditional cocktail recipes from CocktailDB
- Generate custom AI cocktail recipes
- Search by ingredients or cocktail names
- View detailed recipe instructions and ingredients
- Beautiful dark theme UI with modern design
- Responsive layout for all devices

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm
- Dify API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YourUsername/CocktailApp.git
cd CocktailApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Dify API key:
```
REACT_APP_DIFY_API_KEY=your_dify_api_key_here
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:30000](http://localhost:30000) to view it in your browser.

## Technologies Used
- React 18
- React Router v6
- Tailwind CSS
- Axios for API calls
- CocktailDB API for traditional recipes
- Dify AI API for custom recipe generation

## Environment Variables
- `REACT_APP_DIFY_API_KEY`: Your Dify API key for custom recipe generation

## Project Structure
- `/src/pages`: Main application pages
- `/src/components`: Reusable React components
- `/src/services`: API service functions

## Contributing
Feel free to submit issues and enhancement requests.

## License
This project is licensed under the MIT License.
