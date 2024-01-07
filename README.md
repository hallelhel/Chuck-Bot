## Overview
This Telegram bot fetches Chuck Norris jokes from the "101 Chuck Norris Jokes" website, translates them using the Azure Translator API, and runs on the Azure cloud platform @ChuckBotbot.

## Features
- Fetch Chuck Norris jokes from the "101 Chuck Norris Jokes" website.
- Translate jokes to different languages using the Azure Translator API.
- Deployed on the Azure cloud platform for accessibility.

## Prerequisites
- Node.js installed locally.
- Azure Translator API key and endpoint.
- Telegram Bot API token.

## Getting Started
1. Clone the repository
2. cd chuck-Bot
3. Install dependencies: npm install
4. Set up environment variables:
   Create a .env file in the project root.
   Add the following variables:
      TOKEN=your-telegram-bot-token
      KEY=your-azure-translator-api-key
      ENDPOINT=your-azure-translator-endpoint
      LOCATION=your-azure-region
5. Run the bot locally: npm start
