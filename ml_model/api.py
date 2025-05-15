from flask import Flask, request, jsonify
from flask_cors import CORS
from model import CocktailRecommender
import os

app = Flask(__name__)
CORS(app)

# Initialize the model
recommender = CocktailRecommender()
if os.path.exists('cocktail_model.pth'):
    recommender.load_model()
else:
    print("Training new model...")
    recommender.train(epochs=20, batch_size=32)
    recommender.save_model()

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        
        if not ingredients:
            return jsonify({'error': 'No ingredients provided'}), 400
            
        recommendations = recommender.recommend_cocktails(ingredients, n=5)
        return jsonify({'recommendations': recommendations})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(port=5000)
