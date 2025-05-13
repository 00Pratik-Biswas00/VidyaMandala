from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import traceback
import base64
import os
from dotenv import load_dotenv
from block_diagram_generator.diagram_gen import generate_diagram_from_text

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/generate-diagram", methods=["POST"])
def generate_diagram():
    try:
        data = request.get_json()
        content = data.get("text")

        if not content:
            return jsonify({"error": "No text provided"}), 400

        paths = generate_diagram_from_text(content)
        png_path = paths["png"]
        pdf_path = paths["pdf"]

        # Convert PNG to base64 for frontend display
        with open(png_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

        return jsonify({
            "image": encoded_string,
            "pdf_url": "/download-diagram"
        })

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": "Something went wrong"}), 500


@app.route("/download-diagram", methods=["GET"])
def download_diagram():
    pdf_path = os.path.abspath("block_diagram_generator/diagram.pdf")
    if os.path.exists(pdf_path):
        return send_file(pdf_path, as_attachment=True)
    return jsonify({"error": "PDF not found"}), 404


if __name__ == "__main__":
    if not os.getenv("GOOGLE_API_KEY"):
        raise EnvironmentError("GOOGLE_API_KEY not found in .env file!")
    app.run(debug=True)










# In-memory session store
# session_data = {
#     "context": "",
#     "summary": "",
#     "questions": [],
#     "current_index": 0,
#     "current_question": ""
# }

# # Helper to extract text from article
# def get_article_text(url):
#     article = Article(url)
#     article.download()
#     article.parse()
#     return article.text

# # Route to start interaction and generate the first question
# @app.route("/start", methods=["POST"])
# def start():
#     try:
#         data = request.json
#         url = data.get("url")
#         if not url:
#             return jsonify({"error": "URL not provided"}), 400

#         print("[INFO] Received article URL:", url)
#         text = get_article_text(url)

#         prompt = f"""
#         Please summarize the following article:
#         \"\"\"{text[:4000]}\"\"\"

#         Then, generate 5 questions (one at a time) to test understanding.
#         Now, just provide the first question only.
#         """

#         response = model.generate_content(prompt)
#         print("[INFO] Gemini response:", response.text)

#         # Save session data
#         session_data["context"] = text[:4000]
#         session_data["summary"] = ""  # Could be stored from a separate summary if needed
#         session_data["questions"] = [response.text]
#         session_data["current_index"] = 0
#         session_data["current_question"] = response.text

#         return jsonify({"question": response.text})

#     except Exception as e:
#         print("[ERROR]", str(e))
#         traceback.print_exc()
#         return jsonify({"error": "Something went wrong"}), 500

# # Evaluate the answer and return feedback and next question
# @app.route('/answer', methods=['POST'])
# def answer():
#     try:
#         data = request.get_json()
#         user_answer = data.get('answer')

#         if not user_answer:
#             return jsonify({"error": "Answer required"}), 400

#         question = session_data.get("current_question")
#         context_text = session_data.get("context")

#         feedback = evaluate_answer(context_text, question, user_answer)
#         next_question = generate_question()

#         return jsonify({
#             "feedback": feedback,
#             "next_question": next_question
#         })

#     except Exception as e:
#         print("[ERROR]", str(e))
#         traceback.print_exc()
#         return jsonify({"error": "Something went wrong"}), 500

# # Helper to evaluate the user's answer
# def evaluate_answer(article_text, question, user_answer):
#     prompt = f"""
#     Based on this article:
#     \"\"\"{article_text[:4000]}\"\"\"

#     The question was: {question}
#     The user's answer was: {user_answer}

#     Give clear and constructive feedback: Is it correct, partially correct, or incorrect? Why?
#     """
#     response = model.generate_content(prompt)
#     return response.text.strip()

# # Helper to generate the next question
# def generate_question():
#     session_data["current_index"] += 1
#     index = session_data["current_index"]

#     if index >= 5:
#         return "You’ve completed all the questions. Great job!"

#     prev_questions = session_data["questions"]
#     article_text = session_data["context"]

#     prompt = f"""
#     Based on this article:
#     \"\"\"{article_text[:4000]}\"\"\"

#     You have already asked these questions:
#     {prev_questions}

#     Now generate question number {index + 1} to test the user's understanding.
#     """
#     response = model.generate_content(prompt)
#     session_data["questions"].append(response.text)
#     session_data["current_question"] = response.text

#     return response.text.strip()

# # Run the Flask app
# if __name__ == '__main__':
#     app.run(port=8000, debug=True)
