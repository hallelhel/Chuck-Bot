const TelegramBot = require('node-telegram-bot-api');
const JOKES_URL = "https://parade.com/968666/parade/chuck-norris-jokes/"
const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const axios = require("axios");
const ISO6391 = require("iso-639-1")

const TextTranslationClient = require("@azure-rest/ai-translation-text").default
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();
const token = process.env.TOKEN
const key = process.env.KEY
const endpoint = process.env.ENDPOINT
const location = process.env.LOCATION

const bot = new TelegramBot(token, {polling: true});

console.log("strart")
const translateText = async (text, languageCode) => {
    const translateCredential = {
        key: key,
        location,
      };
      const translationClient = new TextTranslationClient(endpoint,translateCredential);
    
      const inputText = [{ text: text }];
      const translateResponse = await translationClient.path("/translate").post({
        body: inputText,
        queryParameters: {
          to: languageCode,
          from: "en",
        },
      });
    
      const translations = translateResponse.body;
      console.log(translations[0].translations[0]?.text)
      return translations[0].translations[0]?.text
}

const headers = {
    Accept: "text/html",
    "Accept-Encoding": "gzip, deflate, br", //indicates the content encoding usually a compression algorithm.
    "Accept-Language": "en-US,en;q=0.5",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
  };

// Function to extract jokes from HTML using Cheerio
const extractJokes = ($) => {
    const jokes = [];
  
    $(".m-detail--body ol li").each((index, elem) => {
      const joke = $(elem);
      jokes.push(joke.text());
    });
    return jokes;
};
  
  // Function to fetch jokes from the specified URL
const fetchJokes = async () => {
    try {
        const response = await axios.get(JOKES_URL, { headers });
        const html = response.data;
        const $ = cheerio.load(html);
        return extractJokes($);
    } 
    catch (error) {
        console.error("Error fetching jokes:", error);
        return [];
    }
};
const getJoke = async (msg, number) => {
    let jokes = []
    try {
        jokes = await fetchJokes()
        // check valid number
        if (number < 1 || number > 101) {
            const translatedMessage = await translateText("Please enter a number between 1 - 101", newLanguageCode)
            bot.sendMessage(
                msg.chat.id,
                translatedMessage
            )
            return
        }

        const joke = jokes[number-1]
        if (joke) {
            const translated = await translateText(joke, newLanguageCode)
            bot.sendMessage(msg.chat.id, `${number}. ${translated}`)

        }
        else {
            const noJokeMessage = await translateText("couldn't fetch your joke", newLanguageCode)
            bot.sendMessage(
                msg.chat.id,
                noJokeMessage
            )
        }
    }
    catch (error) {
        console.error("Error", error)
        const errorTranslating = await translateText("Error translating", newLanguageCode)
        bot.sendMessage(
            msg.chat.id, 
            errorTranslating
        )
    }
    finally {
        jokes.length = 0 
    }
}

bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
    // Handle the error and retry or take appropriate action
});
  
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId, 
        `To set your language, use:  
            set language <Your Language>

To get a joke, enter a number between 1 and 101:  
            <Joke Number>`);
});
// numeric
bot.onText(/^\d+$/, async (msg) => {
    newLanguageCode = 'en' //defult
    const number = parseInt(msg.text)
    await getJoke(msg, number)
})

bot.onText(/set language (.+)/, async (msg, match) => {
    try{
        const chatId = msg.chat.id;
        const newLanguage = match[1].toLowerCase();
        const isoCode = ISO6391.getCode(newLanguage)
        if (isoCode) {
            newLanguageCode = isoCode
            const newLanguageRes = await translateText(
                "No Problem",
                newLanguageCode
            )
            bot.sendMessage(msg.chat.id, newLanguageRes)
        }
        else {
            bot.sendMessage(msg.chat.id, "please choose valid language")
        }
    }
    catch (error) {
        console.error("Error:", error)
        bot.sendMessage(msg.chat.id, "An error occurred, try again")
    }
})
