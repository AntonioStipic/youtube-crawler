const express = require('express');
const fs = require('fs');
const path = require("path");
const {db} = require("./utils/db");

const PORT = 3000;

const app = express();

app.use(express.json());

app.listen(PORT, () => {

    console.log(`Listening on port: ${PORT}`);
});


let processedChannels = 0;
console.log(processedChannels);
app.get('/', (request, response) => {
    response.json({
        message: `ok`
    });
});

app.get('/channels-queue', async (request, response) => {
    const channel = await db.select('*').from('channels_queue').where('status', 'idle').limit(1).then((result) => {
        return result[0];
    });
    if (!channel) {
        response.json({
            code: 404,
            message: 'No channels found!'
        });
        return;
    }

    await db.table('channels_queue').update({
        status: 'in-process'
    }).where('channel_id', channel.channel_id);
    response.json({
        ...channel,
        skip: processedChannels
    })
    processedChannels++;


    // return response.status(200).json({
    //     ...channel
    // });
});


app.post('/write-channels-id-in-db', async (request, response) => {
    const {channel_id, channel_url} = request.body;
    await db.table('channels_queue').insert({
        channel_id,
        channel_url,
        status: 'idle'
    }).onConflict().ignore().catch((err) => {
        console.log(err);
    });
    response.json({
        message: 'ok'
    });
})

app.post('/write-channels-in-db', async (request, response) => {
    const channel = await db.select('*').from('channels_queue').where('status', 'idle').limit(1).then((result) => {
        return result[0];
    });
    if (!channel) {
        response.json({
            code: 404,
            message: 'No channels found!'
        });
        return;
    }
    const {
        channel_id,
        channel_url,
        channel_name,
        num_of_channel_views,
        subscriber_count,
        created_on,
        description,
        links,
        details
    } = request.body;
    await db.table('channels').insert({
        channel_id,
        channel_url,
        channel_name,
        num_of_channel_views,
        subscriber_count,
        created_on,
        description,
        links,
        details
    }).onConflict().ignore().catch((err) => {
        console.log(err);
    });
    await db.table('channels_queue').update({
        status: 'done'
    }).where('channel_id', channel.channel_id);
    response.json({
        message: 'ok'
    });
})


const words = [];

const files = fs.readdirSync(`${__dirname}/words`);
for (const file of files) {
    const fileName = path.resolve(__dirname, 'words', file);
    const fileContent = fs.readFileSync(fileName).toString();
    const languageWords = JSON.parse(fileContent);
    words.push(...languageWords.words.map(item => item.targetWord));
}

let processedWords = 0;
app.get('/', (request, response) => {
    response.json({
        message: `ok`
    });
});

app.get('/processed-word', (request, response) => {

    response.json({
        skip: processedWords,
        word: words[processedWords]
    });
    processedWords++;

});


app.post('/search', async (request, response) => {
    const search = request.body.search;
    const fields = request.body.fields || ['channel_id', 'channel_name', 'channel_url', 'num_of_channel_views', 'subscriber_count', 'created_on'];

    const channel = await db.select('*').from('channels').where('channel_name', '=', search).then((result) => {
        return result;
    });



    response.json({
        channels: channel
    });
});
