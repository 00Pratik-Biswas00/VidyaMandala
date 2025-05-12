# NLP/LLM to generate questions

from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch

# Load model and tokenizer
tokenizer = T5Tokenizer.from_pretrained('valhalla/t5-base-qg-hl')
model = T5ForConditionalGeneration.from_pretrained('valhalla/t5-base-qg-hl')

def generate_questions(context):
    questions = []
    
    # Split into sentences
    sentences = context.split('. ')
    
    # Pick 5 important ones for highlight (or use NLP ranking later)
    top_sentences = sentences[:5]  # simple for now

    for idx, sentence in enumerate(top_sentences):
        # Build input for T5
        input_text = f"generate question: {context} <hl> {sentence.strip()} <hl>"
        input_ids = tokenizer.encode(input_text, return_tensors='pt')

        # Generate output
        outputs = model.generate(
            input_ids=input_ids,
            max_length=64,
            num_beams=4,
            early_stopping=True
        )

        question = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        questions.append({
            "id": idx + 1,
            "question": question,
            "expected_answer": sentence.strip()
        })
    
    return questions
