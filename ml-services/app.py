# Flask API (serve endpoints)

import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from scraper import scrape_article
from question_generator import generate_questions
from answer_evaluator import evaluate_answer

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "fallback-dev-key")  # for session
CORS(app)

@app.route('/start', methods=['POST'])
def start_session():
    url = request.json.get('url')
    article = scrape_article(url)
    questions = generate_questions(article)
    
    session['questions'] = questions
    session['current_index'] = 0
    return jsonify({"message": "Session started", "total_questions": len(questions)})

@app.route('/next-question', methods=['GET'])
def next_question():
    index = session.get('current_index', 0)
    questions = session.get('questions', [])
    
    if index >= len(questions):
        return jsonify({"done": True, "message": "All questions completed."})
    
    return jsonify({"done": False, "question": questions[index]["question"], "id": questions[index]["id"]})

@app.route('/submit-answer', methods=['POST'])
def submit_answer():
    user_answer = request.json.get('answer')
    index = session.get('current_index', 0)
    questions = session.get('questions', [])

    if index >= len(questions):
        return jsonify({"done": True, "message": "No more questions."})
    
    expected = questions[index]['expected_answer']
    feedback = evaluate_answer(user_answer, expected)

    # Move to next question
    session['current_index'] = index + 1
    
    return jsonify({
        "feedback": feedback,
        "next": index + 1 < len(questions)
    })

if __name__ == '__main__':
    app.run(port=8000, debug=True)
