from data_collector import CocktailDataCollector
from model import CocktailRecommender
import json

def main():
    # 1. Collect data
    print("Collecting cocktail data...")
    collector = CocktailDataCollector()
    collector.collect_and_save_data()

    # 2. Initialize and train model
    print("\nInitializing model...")
    recommender = CocktailRecommender()
    
    print("\nTraining model...")
    recommender.train(epochs=20, batch_size=32)
    
    # 3. Save trained model
    print("\nSaving model...")
    recommender.save_model()

    # 4. Test recommendations
    test_ingredients = ['Vodka', 'Orange juice']
    print(f"\nTesting recommendations for ingredients: {test_ingredients}")
    recommendations = recommender.recommend_cocktails(test_ingredients, n=5)
    
    print("\nTop 5 recommended cocktails:")
    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['name']} (Similarity: {rec['similarity']:.3f})")
        print(f"Ingredients: {', '.join(f'{m} {i}' for i, m in zip(rec['ingredients'], rec['measures']))}")
        print(f"Instructions: {rec['instructions']}")

if __name__ == "__main__":
    main()
