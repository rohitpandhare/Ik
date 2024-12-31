from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import requests

app = Flask(__name__)
CORS(app)

API_KEY = "6de17b972dc842fca22883615f5fc008ba8075e0"
BASE_URL = "https://api.indiankanoon.org"

def get_headers():
    return {
        'Authorization': f"Token {API_KEY}"
    }

@app.route('/search/', methods=['POST'])
def search():
    try:
        data = request.get_json()
        query = data.get('formInput')
        pagenum = data.get('pagenum', 0)

        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400

        url = f"{BASE_URL}/search/"
        params = {
            'formInput': query,
            'pagenum': pagenum
        }

        response = requests.post(url, params=params, headers=get_headers())
        response.raise_for_status()
        return jsonify(response.json())

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/doc/<docid>/', methods=['POST'])
def get_document(docid):
    try:
        url = f"{BASE_URL}/doc/{docid}/"
        response = requests.post(url, headers=get_headers())
        response.raise_for_status()
        return jsonify(response.json())

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
