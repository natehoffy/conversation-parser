const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');
const util = require('util')
const ngrok = require('ngrok')

const PORT = 4040
const CONVERSATION_API_BASE = 'https://driftapi.com/v1/conversations'
const TOKEN = process.env.AUTH_TOKEN // only necessary if you're sending data back to the APIs

app.use(bodyParser.json())
app.listen(PORT, () => console.log(`Testing app listening on port ${PORT}!`))

// create external connection - I recommend commenting this out and install ngrok globally
// so the endpoint doesn't refresh every time you restart
ngrok.connect(PORT).then(url => console.log(`External Forwarding URL is: ${url}/api`))

// POST request to our /api endpoint
app.post('/api', (req, res) => {

    // pull out the JSON message
    const body = req.body.data.data.conversationId

    // log the response, use the util function to parse all the way into the object
    console.log(util.inspect(body, {showHidden: false, depth: null}))

    // end the connection with a positive response
    res.status(200)
    return res.end()
})

// HELPER functions
// send a message back to the conversation
const sendMessage = (conversationId, message) => {
    console.log('sending message', message)
    return request.post(CONVERSATION_API_BASE + `/${conversationId}/messages`)
        .set('Content-Type', 'application/json')
        .set(`Authorization`, `bearer ${TOKEN}`)
        .send(message)
        .catch(err => console.log(err))
}

// look up meta data about this conversation
const lookUpConversation = convoId => {
    return request.get('https://driftapi.com/conversations/' + convoId)
        .set(`Authorization`, `bearer ${TOKEN}`)
}