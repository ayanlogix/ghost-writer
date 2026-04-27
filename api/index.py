import os
import asyncio
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../public', static_url_path='')
CORS(app)

# Configure Gemini API
# NOTE: We check if the key is a real key (longer than 20 chars) and not a placeholder
API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
IS_REAL_KEY = len(API_KEY) > 20 and not API_KEY.startswith("YOUR_")

if IS_REAL_KEY:
    try:
        genai.configure(api_key=API_KEY)
    except Exception as e:
        print(f"Failed to configure Gemini: {e}")
        IS_REAL_KEY = False

PROMPTS = {
    "twitter": "Act as a social media growth expert. Write a punchy 5-tweet thread about: {}. Make the first tweet a 'hook' that stops the scroll. Use bullet points and whitespace. End with a CTA.",
    "linkedin": "Act as a thought leader in tech. Write a professional LinkedIn post about: {}. Focus on a 'problem/solution' story. Use short paragraphs and avoid corporate jargon. End with a thought-provoking question.",
    "instagram": "Write a creative Instagram caption about: {}. Include an emotional hook, a short story, and 5 relevant hashtags. Provide 3 variations: Short, Story-telling, and Question-based.",
}

async def generate_content_ai(platform, idea, tone):
    # Mock Mode Fallback
    mock_content = f" [MOCK CONTENT for {platform.upper()}]\n\nIdea: {idea}\nTone: {tone}\n\n(To see real AI magic, please add a valid GEMINI_API_KEY to your .env file!)"

    if not IS_REAL_KEY:
        await asyncio.sleep(1.5)
        return mock_content

    try:
        # 'gemini-pro' is most compatible across older API versions/projects
        model = genai.GenerativeModel('gemini-pro')
        prompt = PROMPTS.get(platform, "Write a social media post about: {}").format(idea)
        prompt += f" Use a {tone} tone."
        
        # Use a timeout context if possible, or just gather
        # Response is not awaitable in the standard genai sync call, but we wrap in asyncio.to_thread if needed
        # Actually, genai.GenerativeModel.generate_content is a sync call in the current SDK
        response = await asyncio.to_thread(model.generate_content, prompt)
        return response.text
    except Exception as e:
        print(f"AI Generation Error: {e}")
        # Return the error but also the mock content so the user is never stuck
        return f" [AI ERROR: {str(e)}]\n\nFALLBACK CONTENT:\n{mock_content}"

@app.route('/api/generate', methods=['POST'])
async def generate():
    data = request.json
    idea = data.get('idea')
    platform = data.get('platform')
    tone = data.get('tone', 'professional')

    if not idea or not platform:
        return jsonify({"error": "Idea and platform are required"}), 400

    content = await generate_content_ai(platform, idea, tone)
    return jsonify({"content": content})

@app.route('/')
def index():
    return send_from_directory('../public', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
