# Doppler

## About

A slackbot which can do a random assortment of things. Made for the Doppel YSWS Program by HackClub. 

## Features

- !meow - Bot meows for you (why?)
- !emote - Get a random emote (e.g. `!emote happy`)
- !help - Show this help message
- !register - Register yourself for using this bot
- !deregister - Deregister yourself from using this bot
- !remindme - *Set a reminder (`!remindme <time (tomorrow, in three days, etc.)> to <reminder text>`)
*All commands with this star means you have to be registered to use it. Still working on that though.

## Notes for myself

When updating stuff, make sure it's updated on nest too!
```bash
scp .env <username>@hackclub.app:~/dopple/.env
scp ./data/emotes.yaml <username>@hackclub.app:~/dopple/data/emotes.yaml
scp ./data/users.json <username>@hackclub.app:~/dopple/data/users.json
```