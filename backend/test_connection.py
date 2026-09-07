import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Find .env in current dir, backend/, or parent dir
possible_paths = [
    Path.cwd() / '.env',
    Path.cwd() / 'backend' / '.env',
    Path(__file__).parent / '.env',
    Path(__file__).parent.parent / '.env',
]

env_found = None
for p in possible_paths:
    if p.exists():
        load_dotenv(p)
        env_found = p
        break

if not env_found:
    print('❌ .env file not found. Creating a template at backend/.env ...')
    target = Path(__file__).parent / '.env'
    target.write_text('OPENAI_API_KEY=\nOPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/\nMODEL_NAME=gemini-2.0-flash\n', encoding='utf-8')
    print(f'Please open {target} and paste your API key after OPENAI_API_KEY=')
    exit(1)

DEFAULT_GROQ_KEY = ""
api_key = os.getenv('GROQ_API_KEY', '').strip() or os.getenv('OPENAI_API_KEY', '').strip()
base_url = os.getenv('OPENAI_BASE_URL', 'https://api.groq.com/openai/v1')
model_name = os.getenv('MODEL_NAME', 'openai/gpt-oss-120b')

print(f'Testing connection to Groq Cloud API with model: {model_name} ...')
client = OpenAI(api_key=api_key, base_url=base_url)

try:
    response = client.chat.completions.create(
        model=model_name,
        messages=[{'role': 'user', 'content': 'Say OK if connected'}]
    )
    print('\n' + '='*50)
    print('[+] SUCCESS! Connected to Groq Cloud API successfully!')
    print('Model Response:', response.choices[0].message.content.strip())
    print('='*50 + '\n')
except Exception as e:
    print('\n[-] Connection Error:', e)
