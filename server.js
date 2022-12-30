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


app.get('/', (request, response) => {
    response.json({
        message: `ok`
    });
});

let processedCategories = -1;
app.get('/get-channel-from-channels', async (request, response) => {
    processedCategories++;
    const channel = await db.select('*').from('channels')
        .where('channel_number_of_videos', '>=', 1)
        .whereNull('category')
        .offset(processedCategories)
        .limit(1)
        .then((result) => {
            return result[0];
        })
    if (!channel) {
        response.json({
            code: 404,
            message: 'No channels found!'
        });
        return;
    }
    response.json({
        ...channel,
        skip: processedCategories
    })
})
app.post('/download-category', async (request, response) => {
    const category = request.body.category;
    const channel = request.body.channel;
    await db.table('channels').update({
        category: category
    }).where('channel_id', '=', channel);
    response.json({
        message: `ok`
    });
})
let processedChannels = -1;
app.get('/channels-queue', async (request, response) => {
    processedChannels++;
    const channel = await db.select('*').from('channels_queue').where('status', 'idle').offset(processedChannels).limit(1).then((result) => {
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
});


app.post('/write-channels-id-in-db', async (request, response) => {
    const {channel_id, channel_url, channel_number_of_videos} = request.body;
    await db.table('channels_queue').insert({
        channel_id,
        channel_url,
        channel_number_of_videos,
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
        details,
        channel_number_of_videos
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
        details,
        channel_number_of_videos
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

let processedWords = 1000;
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

let updatedChannels = -1;
app.get('/get-one-channel-from-channels', async (request, response) => {
    updatedChannels++;
    const channel = await db.select('*').from('channels_queue')
        .offset(updatedChannels)
        .limit(1)
        .then((result) => {
            return result[0];
        })
    if (!channel) {
        response.json({
            code: 404,
            message: 'No channels found!'
        });
        return;
    }
    response.json({
        ...channel,
        skip: updatedChannels
    })
})
app.post('/update-channels-daily', async (request, response) => {

    const {
        id,
        channel_id,
        num_of_channel_views,
        subscriber_count,
        created_on,
    } = request.body;
    await db.table('channels_statistics').insert({
        id,
        channel_id,
        num_of_channel_views,
        subscriber_count,
        created_on,
    })

    response.json({
        message: 'ok'
    });
    
});

