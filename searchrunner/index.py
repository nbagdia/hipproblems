from tornado import gen, ioloop, web
import json
import urllib2
import threading
from urllib2 import URLError

#map to localhost scraper url
scraperurl = "http://localhost:9000/scrapers/"
#provider list
scraperProvider = ["expedia", "orbitz", "priceline", "travelocity", "united "]
#port no to publish merged list
portno = 8000

class ApiHandler(web.RequestHandler):
    @gen.coroutine
    def get(self):
        try :
            self.write({ 
                "results": self.getResults()
                })
        except :
            self.write({
                "Error during thread execution"
                })
        
    def fetch_url(self, url):
        try:
            resp = urllib2.urlopen(url)
            self.data.extend(json.loads(resp.read())["results"])
        except URLError:
            #print the url which returned error
            self.write({
                "Error fetching URL" : url
                })
        except ValueError:
            #print if Json data issues
            self.write({
                "Error in Json Data from URL" : url
                })
            
    
    def getResults(self):  
        #reset self.data to prevent duplication of results over different calls
        self.data = []  
        # threads to process different providers simultaneously
        threads = [threading.Thread(target=self.fetch_url, args=(scraperurl+provider,)) for provider in scraperProvider]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
        #Sort the data
        newlist = sorted(self.data, key=lambda k: k['agony'])
        return (newlist)
      
ROUTES = [
    (r"/flights/search", ApiHandler),
]

def run():
    try :
        app = web.Application(
            ROUTES,
            debug=True,
        )
        app.listen(portno)
        print("Server (re)started. Listening on port %s" %portno)
        ioloop.IOLoop.current().start()
    except :
        print("Cannot start server on port %s" %portno)
        print("Check if it already running on a different terminal")

if __name__ == "__main__":
    run()

