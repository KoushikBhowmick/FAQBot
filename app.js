const env = require('dotenv');
env.config();

var builder = require('botbuilder');
var restify = require('restify');
var Regex = require("regex");
var regExIeltsStart = new builder.RegExpRecognizer('ielts',/^(IELTS|ielts).*/i);

//crete the bot

const connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);

//var intents = new builder.IntentDialog({ recognizers: [recognizer] })
var intents = new builder.IntentDialog({ recognizers: [regExIeltsStart, recognizer], recognizeOrder: 'series' })
.matches('Home', (session) => {
    session.send('You reached Greetings intent, you said \'%s\'.', session.message.text);
})
.matches('ielts', (session,args) => {
	session.send('hi regex');
	console.log(args);
})
.matches('IELTS', (session, args) => {
    var intent = args.intent;
    var entity = builder.EntityRecognizer.findEntity(args.entities, 'Price');
        
    builder.Prompts.choice(
        session, 
        'OK\n which of these best describes your query?', 
        [
            'IELTS', 
            'IELTS Life Skills', 
            'Other Tests'
        ], 
        {listStyle: builder.ListStyle.button}
    );
})
.matches('Services', (session) => {
    session.send('You reached Services intent, you said \'%s\'.', session.message.text);
})

.onDefault((session,args) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents); 

//create bot host web server 
const server = restify.createServer();
server.post('/api/messages',connector.listen());
server.listen(
    process.env.PORT || 3978,
    ()=> console.log('server up')
);