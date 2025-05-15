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
    
if __name__ == "__main__":
    url = "https://www.w3schools.com/python/python_inheritance.asp"
    content = extract_article_content(url)
    print(content)