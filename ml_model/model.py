import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
import torch
import torch.nn as nn
import torch.optim as optim
from typing import List, Tuple, Dict

class CocktailEmbeddingModel(nn.Module):
    def __init__(self, vocab_size: int, embedding_dim: int = 64):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.fc1 = nn.Linear(embedding_dim, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, embedding_dim)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = self.embedding(x)
        x = x.mean(dim=1)  # Average pooling over ingredients
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

class CocktailRecommender:
    def __init__(self, data_file: str = 'cocktail_data.json'):
        self.load_data(data_file)
        self.prepare_data()
        self.build_model()

    def load_data(self, data_file: str):
        """Load cocktail data from JSON file"""
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.df = pd.DataFrame(data['processed_data'])
        
    def prepare_data(self):
        """Prepare data for model training"""
        # Create vocabulary from ingredients
        self.ingredients = set()
        for ing_list in self.df['ingredients']:
            self.ingredients.update(ing_list)
        
        self.ingredient2idx = {ing: idx for idx, ing in enumerate(self.ingredients)}
        self.idx2ingredient = {idx: ing for ing, idx in self.ingredient2idx.items()}
        
        # Create ingredient sequences
        self.sequences = []
        for ing_list in self.df['ingredients']:
            seq = [self.ingredient2idx[ing] for ing in ing_list]
            self.sequences.append(torch.tensor(seq))

    def build_model(self):
        """Initialize the embedding model"""
        self.model = CocktailEmbeddingModel(len(self.ingredients))
        self.optimizer = optim.Adam(self.model.parameters())
        self.criterion = nn.CosineEmbeddingLoss()

    def train(self, epochs: int = 10, batch_size: int = 32):
        """Train the model"""
        self.model.train()
        
        for epoch in range(epochs):
            total_loss = 0
            
            # Create positive and negative pairs
            for i in range(0, len(self.sequences), batch_size):
                batch = self.sequences[i:i + batch_size]
                if len(batch) < 2:  # Need at least 2 samples for comparison
                    continue
                    
                # Pad sequences in batch to same length
                max_len = max(len(seq) for seq in batch)
                padded = torch.stack([
                    torch.cat([seq, torch.zeros(max_len - len(seq)).long()])
                    for seq in batch
                ])
                
                # Get embeddings
                embeddings = self.model(padded)
                
                # Calculate loss using cosine similarity
                anchor = embeddings[:-1]
                positive = embeddings[1:]
                target = torch.ones(len(anchor))
                
                loss = self.criterion(anchor, positive, target)
                
                # Backward pass
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
                
                total_loss += loss.item()
            
            print(f"Epoch {epoch + 1}/{epochs}, Loss: {total_loss:.4f}")

    def get_cocktail_embedding(self, ingredients: List[str]) -> torch.Tensor:
        """Get embedding for a list of ingredients"""
        # Convert ingredients to indices
        indices = [self.ingredient2idx[ing] for ing in ingredients if ing in self.ingredient2idx]
        if not indices:
            raise ValueError("No valid ingredients provided")
            
        # Create tensor and get embedding
        with torch.no_grad():
            seq = torch.tensor(indices)
            embedding = self.model(seq.unsqueeze(0))
        return embedding

    def recommend_cocktails(self, ingredients: List[str], n: int = 5) -> List[Dict]:
        """Recommend cocktails based on ingredients"""
        try:
            # Get query embedding
            query_embedding = self.get_cocktail_embedding(ingredients)
            
            # Get embeddings for all cocktails
            all_embeddings = []
            for ing_list in self.df['ingredients']:
                emb = self.get_cocktail_embedding(ing_list)
                all_embeddings.append(emb)
            
            # Calculate similarities
            similarities = []
            for emb in all_embeddings:
                sim = cosine_similarity(
                    query_embedding.numpy(), 
                    emb.numpy()
                )[0][0]
                similarities.append(sim)
            
            # Get top N recommendations
            top_indices = np.argsort(similarities)[-n:][::-1]
            
            recommendations = []
            for idx in top_indices:
                cocktail = self.df.iloc[idx]
                recommendations.append({
                    'name': cocktail['name'],
                    'ingredients': cocktail['ingredients'],
                    'measures': cocktail['measures'],
                    'instructions': cocktail['instructions'],
                    'similarity': similarities[idx]
                })
            
            return recommendations
            
        except Exception as e:
            print(f"Error getting recommendations: {str(e)}")
            return []

    def save_model(self, path: str = 'cocktail_model.pth'):
        """Save model state"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'ingredient2idx': self.ingredient2idx,
            'idx2ingredient': self.idx2ingredient
        }, path)

    def load_model(self, path: str = 'cocktail_model.pth'):
        """Load model state"""
        checkpoint = torch.load(path)
        self.ingredient2idx = checkpoint['ingredient2idx']
        self.idx2ingredient = checkpoint['idx2ingredient']
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()
