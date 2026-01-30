from flask import Flask, render_template, request
from ai_helper import generate_study_questions

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        topic = request.form.get('topic')
        if not topic or topic.strip() == '':
            return render_template('error.html',
                                   message="Please enter a topic!")

        num_questions = int(request.form.get('num_questions'))
        questions = generate_study_questions(topic, num_questions)

        if "Error:" in questions:
            return render_template('error.html',
                                   message="AI service is unavailable. Please try again later.")

        return render_template('results.html',
                               topic=topic,
                               questions=questions)

    except Exception as e:
        return render_template('error.html',
                               message="Something went wrong. Please try again.")

if __name__ == '__main__':
    app.run(debug=True)
