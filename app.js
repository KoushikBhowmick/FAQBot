var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');

var intentList = require('./models/intentList');
var centreentity = require('./models/centreentity');
var productentity = require('./models/productentity');
var countryStateInfo = require('./models/countryStateInfo');
var productItems = require('./models/productItems');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});


// Create chat bot
var connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());         // Register in-memory state storage
server.post('/api/messages', connector.listen());

//=========================================================
// Recognizers
//=========================================================

var qnarecognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: 'ec308e69-e5d3-4d62-a312-4362f4059929',
    subscriptionKey: '396d979ab8824a91ab1e4d88bc69dd33',
    top: 4
});

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a5891720-2573-4298-903b-850345877d41?subscription-key=c82081f88b644837b284aaa3fffe9a6c&verbose=true&timezoneOffset=0&q='
var luisrecognizer = new builder.LuisRecognizer(model);

//=========================================================
// Bot Dialogs
//=========================================================
//var intents = new builder.IntentDialog({ recognizers: [ qnarecognizer] });
//var intents = new builder.IntentDialog({ recognizers: [qnarecognizer,luisrecognizer], recognizeOrder: 'series' });
var intents = new builder.IntentDialog({ recognizers: [qnarecognizer] })
bot.dialog('/', intents);

intents.matches('qna', [
    function (session, args, next) {
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'answer');
        session.send(answerEntity.entity);
    }
])
/*
.matches(intentList.centre, (session, args) => {
    session.beginDialog(intentList.centre);
})
.matches(intentList.productprice, (session) => {
        session.beginDialog(intentList.productprice);
})   */
.onDefault((session, args) => {        
    session.endConversation("Sorry! could not get your question.");
});


var countryItems = [];
var stateItems = [];
var cityItems = [];
var corfirmItems = ["Divine IELTS Training /n 21/5, Sahapur Colony West, Plot 70, Ground Floor, Western Side Flat, New Alipore, Kolkata, West Bengal 700053",
                     "British Council /n No.16, First Floor, L & T Chambers, Camac Street, Elgin, Kolkata, West Bengal 700017",
                    "IELTS tuition in Kolkata - 25/, 1, Roy Mallick Colony, Ghughudanga, South Dum Dum, Kolkata, West Bengal 700030"];






bot.dialog(intentList.centre, [
    function (session) {
        countryItems = [];
        for (var country in countryStateInfo) {
		countryItems.push(country);
	}
        builder.Prompts.choice(session, "Select Country :", countryItems,
            { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        if (results.response) {
            stateItems= [];
             for (var state in countryStateInfo[results.response.entity]) {
		        stateItems.push(state);
	        }
            builder.Prompts.choice(session, "Select State :", stateItems,
                { listStyle: builder.ListStyle.button });
        }
    },
    function (session, results) {
        if (results.response) {
            cityItems = [];
            for (var city in countryStateInfo["India"][results.response.entity]) {
			 cityItems.push(city);
		 }
            builder.Prompts.choice(session, "Select City :", cityItems,
                { listStyle: builder.ListStyle.button });
        }
    },
    function (session, results) {
        if (results.response) {
            builder.Prompts.choice(session, "Search Result : Did I resolve your query?", corfirmItems,
                { listStyle: builder.ListStyle.button });
        }
    },
    function (session, results) {
        if (results.response) {
            session.endDialog("Thank for your feedback!!!");
        }
    }
]);

bot.dialog(intentList.productprice, [
    function (session) {
        for (var country in countryStateInfo) {
		countryItems.push(country);
	}
        builder.Prompts.choice(session, "Select Country :", countryItems,
            { listStyle: builder.ListStyle.button });
    },
    function (session) {
        builder.Prompts.choice(session, "Select Product :", productItems,
            { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        if (results.response) {
            builder.Prompts.choice(session, "Price of " + results.response.entity + " is INR 500 : Did I resolve your query?", corfirmItems,
                { listStyle: builder.ListStyle.button });
        }
    },
    function (session, results) {
        if (results.response) {
            session.endDialog("Thank for your feedback!");
        }
    }
]);
