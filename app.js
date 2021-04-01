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
// This needs to have the ASYNC keyword because inside this function is a call to another async function meaning we need to wait for it
app.post('/api', async (req, res) => {
    // Put the whole function in a try/catch loop
    // That way if something goes wrong, we can understand it
    // And not throw a fatal error, crashing the whole service
    try {
        // Get the convoId, if for some reason that element didn't exist in the request, it would throw an error
        const conversationId = req.body.data.data.conversationId
        // Use AWAIT to tell this function to hang here until getConversation resolves/rejects a promise to fulfill the conversation data
        const conversation = await getConversation(conversationId)
        // Check if an error message is included in the response and if not...
        if (!conversation.error) {
            // Log the success
            console.log('It worked!', conversation.data)
            // Also resolve the request successfully
            return res.status(200).json(conversation.data);
        } else {
            // Otherwise, log the failure
            console.log('Something went wrong:', conversation.error)
            // And hangup the request with an error message
            return res.status(500).json({error: conversation.error});
        }
    } catch (e) {
        // Catch the generic error and log it
        console.log('Something went wrong.')
        // Also end the request
        return res.status(500).json({error: e});
    }
})

// HELPER functions

// look up meta data about this conversation
const getConversation = (conversationId) => {
    return request.get(CONVERSATION_API_BASE + `/${conversationId}`)
        .set('Content-type', 'application/json')
        .set('Authorization', `Bearer ${TOKEN}`)
        .then(res => {
            return res.body
        })
        .catch(err => {
            return {
                error: err.message
            }
        });
}
