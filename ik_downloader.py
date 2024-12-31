import json
import logging
import os
from datetime import datetime
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IndianKanoonAPI:
    def __init__(self):
        self.base_url = "https://api.indiankanoon.org"
        self.api_key = "6de17b972dc842fca22883615f5fc008ba8075e0"  # Replace with your actual API Key

    def get_headers(self):
        return {
            'Authorization': f"Token {self.api_key}"
        }

    def search_documents(self, query, pagenum=0):
        """
        Search documents using the Indian Kanoon API via POST.
        """
        try:
            url = f"{self.base_url}/search/"
            headers = self.get_headers()
            data = {
                'formInput': query,
                'pagenum': pagenum
            }

            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching documents: {e}")
            raise

    def get_document(self, docid):
        """
        Fetch a specific document using the Indian Kanoon API via POST.
        """
        try:
            url = f"{self.base_url}/doc/{docid}/"
            headers = self.get_headers()

            response = requests.post(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching document: {e}")
            raise


def test_ik_api():
    api = IndianKanoonAPI()
    try:
        logger.info("Testing search_documents API...")
        search_results = api.search_documents("salman khan", 3)
        logger.info(json.dumps(search_results, indent=4))

        if search_results.get("docs"):
            first_doc_id = search_results["docs"][0]["tid"]
            logger.info(f"Testing get_document API for docid: {first_doc_id}")
            document = api.get_document(first_doc_id)
            logger.info(json.dumps(document, indent=4))
    except Exception as e:
        logger.error(f"Test failed: {e}")


if __name__ == "__main__":
    test_ik_api()
