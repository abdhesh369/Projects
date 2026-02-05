# AI Study Buddy

## Overview
AI Study Buddy is a Flask-based web application that generates practice questions for studying. It leverages the OpenRouter API (specifically GPT-4o-mini) to create clear and educational questions and answers based on user-provided topics.

## Features
- **Topic-based Generation**: Enter any subject to get tailored questions.
- **Customizable Quantity**: Choose how many questions you want.
- **Instant Feedback**: View questions and answers immediately.
- **Simple Interface**: Clean and easy-to-use web interface.

## Prerequisites
- Python 3.8 or higher
- An OpenRouter API Key

## Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    it is recommended to use a virtual environment.
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    
    pip install -r requirements.txt
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your OpenRouter API key:
    ```
    OPENROUTER_API_KEY=your_api_key_here
    ```

## Usage

1.  **Run the application**:
    ```bash
    python app.py
    ```

2.  **Open your browser**:
    Navigate to `http://127.0.0.1:5000`

3.  **Generate Questions**:
    - Enter a topic (e.g., "Photosynthesis", "Linear Algebra").
    - Select the number of questions.
    - Click "Generate Questions".

## Project Structure
- `app.py`: Main Flask application file.
- `ai_helper.py`: logic for interacting with the AI API.
- `templates/`: HTML templates for the web interface.
- `static/`: Static assets (CSS/JS).
