const puppeteer = require('puppeteer');
const axios = require("axios");
const {db} = require("./utils/db");
const {random} = require("@jaspero/utils");
let browser = null;

async function updateChannel(channel, procCookies = false) {
    const page = await browser.newPage();

    try {
        await page.setViewport({width: 1200, height: 800});
        await page.goto(channel.channel_url);

        await page.waitForTimeout(4000);

        let isThereElem = await page.evaluate(() => {
            return [...document.querySelectorAll('#message')].some(it => it.innerText === 'This page isn\'t available. Sorry about that.');
        })
        if (isThereElem) {
            await page.close();
        }

        let cookie = false;
        if (procCookies) {
            try {
                await page.evaluate(() => {
                    document.querySelector('#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.qqtRac > div.VtwTSb > form:nth-child(3) > div > div > button > span')?.click();
                });

                cookie = true;

                await page.waitForTimeout(4000);
            } catch (e) {
                console.error('Cookie popup not found', channel.channel_id);
            }

            if (!cookie) {
                try {
                    await page.evaluate(() => {
                        document.querySelector('[aria-label="Accept the use of cookies and other data for the purposes described"]').click();
                    });

                    await page.waitForTimeout(4000);
                } catch (e) {
                    console.error('Cookie popup not found', channel.channel_id);
                }
            }
            return;
        }
    } catch (e) {
        console.log('Cookies not found');
    }

    try {
        axios.get(channel.channel_url + '/about').then(async response => {
            const regex = /"viewCountText":{"simpleText":"(.*) pregleda"}/gm.exec(response.data)?.[1];
            const viewCount = parseInt(regex?.replace(/\./g, '')?.replace(/ /g, '')?.replace(/,/g, '')?.replace(/k/g, '000')?.replace(/m/g, '000000')?.replace(/b/g, '000000000'));
            const regexNumberOfVideos = /"videosCountText":{"runs":\[{"text":"(.*?)"}/gm.exec(response.data)?.[1];
            const numberOfVideos = parseInt(regexNumberOfVideos);

            let subscriberCount = "";
            const regexSubscriber = /"subscriberCountText":{"accessibility":{"accessibilityData":{"label":"(.*) pretplatnika"}/gm.exec(response.data)?.[1];
            if(regexSubscriber !== undefined) {
                const regexNum = /"subscriberCountText":{"accessibility":{"accessibilityData":{"label":"(.*) pretplatnika"}/gm.exec(response.data)?.[2];
                subscriberCount = parseInt(regexSubscriber?.replace(/\./g, '')?.replace(/ /g, '')?.replace(/,/g, '')?.replace(/k/g, '000')?.replace(/m/g, '000000')?.replace(/b/g, '000000000'));
                switch (regexNum) {
                    case 'K':
                        subscriberCount *= 1000;
                        break;
                    case 'M':
                        subscriberCount *= 1_000_000;
                        break;
                    case 'B':
                        subscriberCount *= 1_000_000_000;
                        break;
                    case 'milijuna':
                        subscriberCount *= 1_000_000;
                        break;
                    case 'tisuća':
                        subscriberCount *= 1000;
                        break;
                    case 'milijardi':
                        subscriberCount *= 1_000_000_000;
                        break;
                    default:
                        break;
                }
            }
            const channelData = channel.channel_id;
            const date = new Date();
            const data = {
                id: random.string(64),
                viewCount: viewCount || 0,
                subscriberCount: subscriberCount || 0,
                date,
                channelData,
                channel_number_of_videos: numberOfVideos || 0
            }
            await axios({
                method: 'post',
                url: 'http://192.168.100.201:3000/update-channels-daily',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    id: data.id,
                    channel_id: data.channelData,
                    num_of_channel_views: data.viewCount,
                    created_on: data.date,
                    subscriber_count: data.subscriberCount,
                    channel_number_of_videos: data.channel_number_of_videos
                }
            }).then((response) => {
                return response.data;
            });

        }).catch(error => {
            console.log(error);
        });
        await page.close();
    } catch
        (e) {
        console.log('error', e);
        await page.close();
    }
}


async function exec() {


    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const firstChannel = {
        channel_id: 'Anomaly',
        channel_url: 'https://www.youtube.com/@Anomaly'
    }
    console.log('Preparing to download the first channel: ' + firstChannel.channel_id);
    await updateChannel(firstChannel, true);
    console.log('Preparation successful');
    const PARALLEL = 5;

    async function parseVideo() {
        const data = await axios({
            method: 'get',
            url: 'http://192.168.100.201:3000/get-one-channel-from-channels',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const channel = data.data;


        console.log('index', channel.skip + 1, channel.channel_id);

        await updateChannel(channel);


        return parseVideo().catch((error) => {
            if (!fs.existsSync('error.log')) {
                fs.writeFileSync('error.log', '');
            }
            fs.appendFileSync('error.log', Date.now() + ' - ' + channel + ' - ' + (error || '').toString() + '\n');
            return parseVideo();
        });
    }

    await Promise.allSettled(
        new Array(PARALLEL).fill(null).map(() => {
            return parseVideo();
        })
    );


}

exec()
    .then()
    .catch()


