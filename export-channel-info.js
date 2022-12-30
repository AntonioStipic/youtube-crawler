const puppeteer = require('puppeteer');
const axios = require("axios");
const {db} = require("./utils/db");
const {random} = require("@jaspero/utils");
let browser = null;

async function downloadChannel(channel, procCookies = false) {
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
            const regexViews = /"viewCountText":{"simpleText":"(.*) pregleda"}/gm.exec(response.data)?.[1];
            const viewCount = parseInt(regexViews?.replace(/\./g, '')?.replace(/ /g, '')?.replace(/,/g, '')?.replace(/k/g, '000')?.replace(/m/g, '000000')?.replace(/b/g, '000000000'));

            const regexChannelName = /false,"title":{"simpleText":"(.*)"},"avatar"/gm.exec(response.data)?.[1];
            const channelName = regexChannelName;


            const regexDescription = /{"description":{"simpleText":"(.*),"primaryLinks"/gm.exec(response.data)?.[1];
            const channelDescription = regexDescription.split('}')[0];

            const regexCreationDate = /{"text":"Korisnik se pridružio "},{"text":(.*)"}]},"ca/gm.exec(response.data)?.[1];
            const creationDate = regexCreationDate.replace(/"/g, '').replace(/,/g, '');
            const creationDateDay = parseInt(creationDate.split('.')[0]);
            const creationDateMonth = (creationDate.split('.')[1]).split(' ')[1];
            const creationDateYear = (creationDate.split('.')[1]).split(' ')[2];
            const months = ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'];
            const newDate = new Date(`${creationDateYear}-${months.indexOf(creationDateMonth) + 1}-${creationDateDay}`);


            const regexSubscriber = /"subscriberCountText":{"accessibility":{"accessibilityData":{"label":"(.*) pretplatnika"}/gm.exec(response.data)?.[1];
            const regexNum = /"subscriberCountText":{"accessibility":{"accessibilityData":{"label":"(.*) pretplatnika"}/gm.exec(response.data)?.[2];
            let subscriberCount = parseInt(regexSubscriber?.replace(/\./g, '')?.replace(/ /g, '')?.replace(/,/g, '')?.replace(/k/g, '000')?.replace(/m/g, '000000')?.replace(/b/g, '000000000'));
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
            const channelId = channel.channel_id;
            const channelUrl = channel.channel_url;
            const date = new Date();
            const data = {
                id: random.string(64),
                viewCount: viewCount || 0,
                subscriberCount: subscriberCount || 0,
                date,
                channelId,
                channelUrl,
                created_on: newDate,
                channel_name: channelName,
                description: channelDescription
            }

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
    await downloadChannel(firstChannel, true);
    console.log('Preparation successful');

    await downloadChannel(firstChannel);
    const PARALLEL = 5;

    // async function parseVideo() {
    //     const data = await axios({
    //         method: 'get',
    //         url: 'http://localhost:3000/channels-queue',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });
    //     const channel = data.data;
    //
    //
    //     console.log('index', channel.skip + 1, channel.channel_id);
    //
    //     await downloadChannel(channel);
    //
    //
    //     return parseVideo().catch((error) => {
    //         if (!fs.existsSync('error.log')) {
    //             fs.writeFileSync('error.log', '');
    //         }
    //         fs.appendFileSync('error.log', Date.now() + ' - ' + channel + ' - ' + (error || '').toString() + '\n');
    //         return parseVideo();
    //     });
    // }
    //
    // await Promise.allSettled(
    //     new Array(PARALLEL).fill(null).map(() => {
    //         return parseVideo();
    //     })
    // );


}

exec()
    .then()
    .catch()


