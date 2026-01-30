from flask import Flask, render_template, request
from ai_helper import generate_study_questions

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    topic = request.form.get('topic')
    num_questions = int(request.form.get('num_questions'))

    questions = generate_study_questions(topic, num_questions)

    return render_template('results.html',
                           topic=topic,
                           questions=questions)

if __name__ == '__main__':
    app.run(debug=True)
