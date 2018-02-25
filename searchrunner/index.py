from tornado import gen, ioloop, web
import json
import urllib2
import threading
from urllib2 import URLError

scraperurl = "http://localhost:9000/scrapers/"
scraperProvider = ["expedia", "orbitz", "priceline", "travelocity", "united "]
portno = 8000

class ApiHandler(web.RequestHandler):
    data = []
    @gen.coroutine
    def get(self):
        self.write({ 
            "results": self.getResults()
        })
        
    def fetch_url(self, url):
        try:
            r = urllib2.urlopen(url)
            #JSON encoding breaks into Unicode by default, hence force read into charset or UTF-8
            self.data.extend(json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))["results"])
        except URLError:
            self.write({
                "Error fetching URL" : url
                })
            return
        except ValueError:
            self.write({
                "Error in Json Data from URL" : url
                })
            return
    
    def getResults(self):    
        threads = [threading.Thread(target=self.fetch_url, args=(scraperurl+provider,)) for provider in scraperProvider]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
        newlist = sorted(self.data, key=lambda k: k['agony'])
        return (newlist)
        
ROUTES = [
    (r"/flights/search", ApiHandler),
]

def run():
    app = web.Application(
        ROUTES,
        debug=True,
    )
    app.listen(portno)
    print("Server (re)started. Listening on port %s" %portno)
    ioloop.IOLoop.current().start()

if __name__ == "__main__":
    run()

