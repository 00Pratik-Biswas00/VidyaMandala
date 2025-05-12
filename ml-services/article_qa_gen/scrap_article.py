from bs4 import BeautifulSoup
import requests
from readability import Document

def extract_article_content(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        doc = Document(response.text)
        soup = BeautifulSoup(doc.summary(), 'html.parser')
        
        # Clean up the content
        for element in soup(['script', 'style', 'nav', 'footer', 'iframe']):
            element.decompose()
            
        return soup.get_text(separator='\n', strip=True)
    except Exception as e:
        print(f"Error extracting content: {e}")
        return None