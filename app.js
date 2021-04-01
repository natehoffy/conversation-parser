const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');
const util = require('util')
const ngrok = require('ngrok')

const PORT = 4040
const CONVERSATION_API_BASE = 'https://driftapi.com/conversations'
const TOKEN = process.env.AUTH_TOKEN // only necessary if you're sending data back to the APIs

app.use(bodyParser.json())
app.listen(PORT, () => console.log(`Testing app listening on port ${PORT}!`))

// create external connection - I recommend commenting this out and install ngrok globally
// so the endpoint doesn't refresh every time you restart
ngrok.connect(PORT).then(url => console.log(`External Forwarding URL is: ${url}/api`))

// POST request to our /api endpoint
app.post('/api', (req, res) => {

    // pull out the JSON message
    const conversationId = req.body.data.data.conversationId


    // log the response, use the util function to parse all the way into the object
    console.log(util.inspect(conversationId, {showHidden: false, depth: null}))
    console.log(getConversation(conversationId))

    // end the connection with a positive response
    res.status(200)
    return res.end()
})

// HELPER functions

// look up meta data about this conversation
const getConversation = (conversationId) => {
    console.log("Retrieving conversation")
    return request.get(CONVERSATION_API_BASE + `/${conversationId}`)
        .set('Content-type', 'application/json')
        .set(`Authorization`, `bearer ${TOKEN}`)
        .catch(err => console.log(err))
}
