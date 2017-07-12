# Hipmunk Lessenger API Spec

*Hipmunk Lessenger* is a minimalist browser-based bot UI that is capable of communicating with a bot engine.

The Hipmunk Lessenger UI is a webapp that will expect a server implementing its API to be available at `localhost:9000` (i.e., your development machine). The server should expose following HTTP route:

- `POST /chat/messages` - a route capable of receiving messages, and optionally replying with a response.

In order to allow cross-origin requests from the UI (the UI is served by github and your server will be on a different domain, `localhost:9000`), the route you expose needs to use a CORS mechaism.


## Receiving Messages

User generated messages will be sent as `POST` requests to the `/chat/message` route. The data will be encoded in `multipart/form-data` format.

When the user joins a chat, you will recieve a message with data about the user. When the user sends a message, you will recieve a message with the user's message in `text`.

Fields:
* `action`: (string) one of `join`, `message`
* `user_id`: (number) unique identifier for the user

`join` Fields:
* `name`: (string) corresponds to user's name.

`message` Fields:
* `text`: (string) text of user message.

Join Action Example:

```
{
    "action": "join",
    "user_id": 123456,
    "name": "John"
}
```

Message Action Example:

```
{
    "action": "message",
    "user_id": 123456,
    "text": "I want a hamburger"
}
```


## Sending Messages
You can send messages back to the user by writing a response object (in JSON) to the webhook request.

### Message Objects
A message object represents a single response element in the Lessenger UI.

Fields:
* `type`: (string) one of `text`, `rich`

`text` Fields:
* `text`: (string) text of your response. Limited to 300 characters.

`rich` Fields:
* `html`: (string) html of your response.


### Response
A response object consists of one or more message objects. Sending multiple messages results in multiple messages appearing.

Fields:
* `messages`: (array) message objects to display.

Example Response:

```
{
    "messages": [
        {
            "type": "text",
            "text": "Sorry, I don't have any sandwiches, but have a picture instead:"
        },
        {
            "type": "rich",
            "html": "<img src='http://i.imgur.com/J9DLQ.png'>"
        }
    ]
}
```
