# Hipmunk Lessenger Coding Challenge

Hello Hipmunk is built on a chatbot engine that handles conversational interactions. It manages the complexity of natural langage and controls the lifecycle of a user's interaction with the chatbot

Your challenge is to build a chatbot engine on the Hipmunk Lessenger messaging platform using the [Lessenger API](api.md) that implements several features described below. Keep it simple - you don't necessarily need to use any sophisticated [NLP](https://en.wikipedia.org/wiki/Natural_language_processing) or [NLU](https://en.wikipedia.org/wiki/Natural_language_understanding) services/packages to solve this problem.

Feel free to take liberties with the responses your bot provides - it's not a requirement to exactly match our examples.

Your deliverable will be a webserver that implements the API described in the documentation for the Hipmunk Lessenger Platform: [API Docs](api.md).

You can reach the Hipmunk Lessenger UI here: [Lessenger UI](http://hipmunk.github.io/hipproblems/lessenger/)

Notes:
* While the UI supports modern browsers, we suggest using Chrome.
* You will have to address the cross-domain nature of the Lessenger by using a CORS mechanism on your webserver.

# Welcome Message

When the user joins a chat with your bot, you should respond with a personalized greeting. Example:
```
Hello, John!
```

# Weather

Your users are fascinated by the weather. Build a weather reporting capability.

## Requirements

Your chatbot engine should be able to handle the following cases:

Note: `<Location>` can be any city or reference to a city such as `SF` or `San Francisco`, or `94100`.

### Current Weather:

If the user enters one of:
* `what's the weather in <Location>`
* `weather in <Location>`
* `<Location> weather`

Respond with the current weather. Example:
```
Currently it's 48F. Rain
```

## Data APIs
You should use the following APIs to help you build your chatbot. You should have recieved an API key from hipmunk for each of these services.

* The DarkSky Forecast API https://darksky.net/dev/docs/forecast accepts a coordinate point and provides current weather and a forecast.
* The Google Gecoding API https://developers.google.com/maps/documentation/geocoding/start will help you convert arbitrary strings that describe locations to coordinate points. (hint: the query param `address` doesn't need to be a fully formed address).

# Deliverables
* A zip file or GitHub link with your project. We should be able to see the source of your project.
* A README with instructions to run your chatbot engine. If you want to use outside sources for parts of your submission, please clearly cite them.
* If you choose to use a zip file, please use revision control and send the entire repository (we want to be able to see your revision history).
