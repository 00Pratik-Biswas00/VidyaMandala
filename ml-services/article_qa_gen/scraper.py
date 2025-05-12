 # For extracting article content

from newspaper import Article

def scrape_article(url):
    article = Article(url)
    article.download()
    article.parse()
    return article.text
