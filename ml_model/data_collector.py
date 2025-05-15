import requests
import json
import time
from typing import List, Dict
import pandas as pd

class CocktailDataCollector:
    def __init__(self):
        self.base_url = "https://www.thecocktaildb.com/api/json/v1/1"
        self.cocktails = []

    def get_all_cocktails_by_first_letter(self) -> List[Dict]:
        """Collect all cocktails by searching first letter (a-z)"""
        all_cocktails = []
        for letter in 'abcdefghijklmnopqrstuvwxyz':
            response = requests.get(f"{self.base_url}/search.php?f={letter}")
            if response.status_code == 200:
                data = response.json()
                if data['drinks']:
                    all_cocktails.extend(data['drinks'])
            time.sleep(0.1)  # Be nice to the API
        return all_cocktails

    def process_cocktail_data(self, cocktails: List[Dict]) -> pd.DataFrame:
        """Process raw cocktail data into a structured format"""
        processed_data = []
        
        for cocktail in cocktails:
            # Get ingredients and measures
            ingredients = []
            measures = []
            for i in range(1, 16):
                ing = cocktail.get(f'strIngredient{i}')
                mea = cocktail.get(f'strMeasure{i}')
                if ing:
                    ingredients.append(ing.strip())
                    measures.append(mea.strip() if mea else 'to taste')

            processed_data.append({
                'id': cocktail['idDrink'],
                'name': cocktail['strDrink'],
                'category': cocktail['strCategory'],
                'alcoholic': cocktail['strAlcoholic'],
                'glass': cocktail['strGlass'],
                'instructions': cocktail['strInstructions'],
                'ingredients': ingredients,
                'measures': measures,
                'ingredient_measures': list(zip(ingredients, measures))
            })
        
        return pd.DataFrame(processed_data)

    def collect_and_save_data(self, output_file: str = 'cocktail_data.json'):
        """Collect all cocktail data and save to file"""
        print("Collecting cocktail data...")
        cocktails = self.get_all_cocktails_by_first_letter()
        
        print(f"Processing {len(cocktails)} cocktails...")
        df = self.process_cocktail_data(cocktails)
        
        # Save both raw and processed data
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'raw_data': cocktails,
                'processed_data': df.to_dict(orient='records')
            }, f, indent=2)
        
        print(f"Data saved to {output_file}")
        return df

if __name__ == "__main__":
    collector = CocktailDataCollector()
    df = collector.collect_and_save_data()
