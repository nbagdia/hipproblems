const ENTER_KEY = 13;
const ENDPOINT = "http://localhost:9000/chat/messages";
const Styles = [
    "server-error",
    "user-msg",
    "server-msg",
    "message-layout",
    "user-layout",
    "message-view",
    "message-input",
    "message-button",
    "user-button",
    "user-title",
    "user-field",
    "message-field",
].reduce(function(res, item){res[_.camelCase(item)] = item; return res;}, {});

class MessageView extends React.Component {
    static propTypes = {
        model: PropTypes.object.isRequired,
    }

    componentDidMount() {  // eslint-disable-line require-jsdoc
        this.scrollToBottom();
    }

    componentDidUpdate() {  // eslint-disable-line require-jsdoc
        this.scrollToBottom();
    }

    scrollToBottom = () => {  // eslint-disable-line require-jsdoc
        this.messagesEnd.scrollIntoView({behavior: "instant"});
    }

    render() {  // eslint-disable-line require-jsdoc
        return (
            <div className={Styles.messageView}>
            {
                this.props.model.messages.map((msg, key) => {
                    return msg.render(key);
                })
            }
                <div
                    key="dummy"
                    style={{
                        float: "left",
                        clear: "both",
                    }}
                    ref={(elem) => { this.messagesEnd = elem; }}
                />
            </div>
        );
    }

}

class Layout extends React.Component { // eslint-disable-line react/no-multi-comp
    static propTypes = {
        model: PropTypes.object.isRequired,
    }
    state = {
        newMessage: '',
    }

    handleKeyDown(event) {  // eslint-disable-line require-jsdoc
        if (event.keyCode !== ENTER_KEY) {
            return;
        }

        event.preventDefault();
        this.maybeSendMessage();
    }

    handleChange(event) {  // eslint-disable-line require-jsdoc
        this.setState({newMessage: event.target.value});  // eslint-disable-line react/no-did-mount-set-state, react/no-set-state
    }

    maybeSendMessage() {  // eslint-disable-line require-jsdoc
        const new_message = this.state.newMessage.trim();
        if (new_message) {
            if (this.props.model.user_name) {
                this.props.model.sendUserMessage(new_message);
            } else {
                this.props.model.setUserName(new_message);
            }
            this.setState({newMessage: ''});  // eslint-disable-line react/no-did-mount-set-state, react/no-set-state
        }
    }

    render() {  // eslint-disable-line require-jsdoc
        if (this.props.model.user_name) {
            return (
                <div className={Styles.messageLayout}>
                    <MessageView model={this.props.model}/>
                    <div className={Styles.messageInput}>
                        <input
                            className={Styles.messageField}
                            onKeyDown={this.handleKeyDown.bind(this)}
                            onChange={this.handleChange.bind(this)}
                            value={this.state.newMessage}
                            autoFocus={true}
                        />
                        <button
                            className={Styles.messageButton}
                            onClick={this.maybeSendMessage.bind(this)}
                        >Send</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={Styles.userLayout}>
                    <div className={Styles.userTitle}>
                        Enter Your Name:
                    </div>
                    <input
                        className={Styles.userField}
                        onKeyDown={this.handleKeyDown.bind(this)}
                        onChange={this.handleChange.bind(this)}
                        value={this.state.newMessage}
                        autoFocus={true}
                    />
                    <button
                        className={Styles.userButton}
                        onClick={this.maybeSendMessage.bind(this)}
                    >Get Started</button><div></div>
                </div>
            );
        }
    }

}

class UserMessage {
    constructor(text, user_id) {  // eslint-disable-line require-jsdoc
        this.text = text;
        this.user_id = user_id;
    }

    serialize() {  // eslint-disable-line require-jsdoc
        return {
            user_id: this.user_id,
            action: "message",
            text: this.text,
        };
    }

    render(key) {  // eslint-disable-line require-jsdoc
        return (
            <div className={Styles.userMsg} key={key}>{this.text}</div>
        );
    }
}

class UserJoin {
    constructor(user_name, user_id) {  // eslint-disable-line require-jsdoc
        this.user_name = user_name;
        this.user_id = user_id;
    }

    serialize() {  // eslint-disable-line require-jsdoc
        return {
            user_id: this.user_id,
            action: "join",
            name: this.user_name,
        };
    }
}


class ServerMessage {
    constructor({type, html, text}) {  // eslint-disable-line require-jsdoc
        this.type = type;
        this.html = html;
        this.text = text;
        if (!((type === "text" && text) || (type === "rich" && html))) {
            throw new Error("a message is malformed");
        }
    }

    render(key) {  // eslint-disable-line require-jsdoc
        if (this.type === "rich") {
            // this is obviously a really bad idea for a real app, but it gives
            // candidates an opportunity to do something mildly fun.
            const html_obj = {__html: this.html};
            return (
                <div
                    className={Styles.serverMsg}
                    dangerouslySetInnerHTML={html_obj}
                    key={key}
                />
            );
        }
        return (
            <div className={Styles.serverMsg} key={key}>{this.text}</div>
        );
    }
}

class ServerError {
    constructor(err, text) {  // eslint-disable-line require-jsdoc
        this.err = err;
        this.text = text;
    }

    render(key) {  // eslint-disable-line require-jsdoc
        return (
            <div className={Styles.serverError} key={key}>{this.text}</div>
        );
    }

}

class Model {
    /**
     * Construct the data model
     */
    constructor() {
        this.messages = [];
        this.subscribed = [];
        this.user_name = null;
        this.user_id = _.random(0, 10000000);
    }

    /**
     * Subscribe a callback to future model updates
     * @param {Function} callback
     */
    subscribe(callback) {
        this.subscribed.push(callback);
    }

    /**
     * Dispatch updates to subscribed callbacks
     */
    update() {
        this.subscribed.forEach((callback) => {
            callback();
        });
    }

    /**
     * Make a FormData from an object
     * @param {Object} obj
     * @return {FormData}
     */
    makeForm(obj) {
        const form = new FormData();
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                form.append(key, obj[key]);
            }
        }
        return form;
    }

    /**
     * Set user's name
     * @param {String} user_name
     */
    setUserName(user_name) {
        this.user_name = user_name;
        this.update();
        this.sendMessageToAPI(new UserJoin(user_name, this.user_id));
    }

    /**
     * Dispatch a text message to the server
     * @param {String} msg_text
     */
    sendUserMessage(msg_text) {
        const user_msg = new UserMessage(msg_text, this.user_id);
        this.messages.push(user_msg);
        this.update();
        this.sendMessageToAPI(user_msg);
    }

    /**
     * Dispatch a message object to the server
     * @param {Message} msg
     */
    sendMessageToAPI(msg) {
        fetch(ENDPOINT, {
            method: 'POST',
            body: this.makeForm(msg.serialize()),
        })
        .then((res) => {
            res.json()
            .then((data) => {
                if (!('messages' in data)) {
                    throw new Error("Response object is missing 'messages'");
                }
                if (!Array.isArray(data.messages)) {
                    throw new Error("'messages' is malformed");
                }
                this.messages = this.messages.concat(
                    data.messages.map((obj) => {
                        return new ServerMessage(obj);
                    }
                ));
                this.update();
            })
            .catch(this.handleError.bind(this));
        })
        .catch(this.handleError.bind(this));
    }

    /**
     * Handle various types of errors
     * @param {Error} err
     */
    handleError(err) {
        let err_msg;
        if (err.name === "Error") {
            err_msg = new ServerError(err, err.message);
        } else if (err.name === "TypeError" && (
            err.message === "Failed to fetch" ||
            err.message === "NetworkError when attempting to fetch resource."
        )) {
            err_msg = new ServerError(
                err, `Server not available. Is your server running?
                Is it responding with an appropriate CORS header?
                Check the console for more info.`);
        } else if (err.name === "SyntaxError" && err.message.includes("JSON")) {
            err_msg = new ServerError(
                err, `Server Responded with invalid JSON.`);
        } else {
            err_msg = new ServerError(
                err, `Generic failure communicating with '${ENDPOINT}', Check the console for more info.`);
        }
        this.messages.push(err_msg);
        this.update();
        throw err;
    }
}

// closure to launch the app
(function() {
    const model = new Model();

    const render = () => {
        ReactDOM.render(
            <Layout model={model} />,
            document.querySelector('#content')
        );
    };

    model.subscribe(render);
    render();
})();
