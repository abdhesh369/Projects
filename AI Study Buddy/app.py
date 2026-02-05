import os
from flask import Flask, render_template, request
from ai_helper import generate_study_questions

app = Flask(__name__)

if not os.getenv("OPENROUTER_API_KEY"):
    print("WARNING: OPENROUTER_API_KEY is not set.")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    try:
        topic = request.form.get("topic", "").strip()
        if not topic:
            return render_template("error.html",
                                   message="Please enter a topic.")

        try:
            num_questions = int(request.form.get("num_questions"))
            if not 1 <= num_questions <= 20:
                raise ValueError
        except (ValueError, TypeError):
            return render_template("error.html",
                                   message="Invalid number of questions.")

        difficulty = request.form.get("difficulty")
        if difficulty not in ["easy", "medium", "hard"]:
            return render_template("error.html",
                                   message="Invalid difficulty selected.")

        questions = generate_study_questions(
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions
        )

        if questions.startswith("Error:"):
            return render_template("error.html",
                                   message=questions)

        return render_template(
            "results.html",
            topic=topic,
            questions=questions
        )

    except Exception as e:
        print(f"Server Error: {e}")
        return render_template(
            "error.html",
            message="Something went wrong. Please try again."
        )


if __name__ == "__main__":
    app.run(debug=True)
