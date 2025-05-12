# Evaluate answer vs expected

from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

def evaluate_answer(user_answer, expected_answer):
    embeddings = model.encode([user_answer, expected_answer])
    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
    
    if similarity > 0.8:
        return f"✅ Great! Your answer is accurate. (Similarity: {similarity:.2f})"
    elif similarity > 0.5:
        return f"🟡 Decent answer, but could be improved. (Similarity: {similarity:.2f})"
    else:
        return f"❌ Not quite. Try to be more specific. (Similarity: {similarity:.2f})"
