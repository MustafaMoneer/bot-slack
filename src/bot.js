// MODULES IMPORT
const recast = require('recastai')
const config = require('../config.js')
const http = require('http')
const slack = require('@slack/client')

// RECAST.AI INIT: Language is optionnal
const recastClient = new recast.Client(config.recast.token, config.recast.language)

// SLACK CLIENT INIT
const SlackClient = slack.RtmClient
const slackEvent = slack.RTM_EVENTS
const rtm = new SlackClient(config.slack.token, { logLevel: 'false' })
rtm.start()

// EVENT: Message received on Slack
rtm.on(slackEvent.MESSAGE, (message) => {
  const user = rtm.dataStore.getUserById(message.user)
  const dm = rtm.dataStore.getDMByName(user.name).id

  // CALL TO RECAST.AI: Message.user contain a unique Id of your conversation in Slack
  // The converseToken is what let Recast identify your conversation.
  // As message.user is what identify your slack conversation, you can use it as converseToken.

  recastClient.textConverse(message.text, { converseToken: message.user })
  .then((res) => {
    const replies = res.replies
    const action = res.action

    if (!replies.length) {
      rtm.sendMessage('I didn\'t understand... Sorry :(', dm)
      return
    }

    if (action.done) {
      // Do something if you need: use res.memory('knowledge') if you got a knowledge from this action
    }

    replies.forEach(reply => rtm.sendMessage(reply, dm))
  })
  .catch((err) => {
    console.log(err)
    rtm.sendMessage("I'm getting tired, let's talk later", dm)
  })
})

// SERVER INIT
http.createServer().listen(8080)
