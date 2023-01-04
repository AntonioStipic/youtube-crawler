const puppeteer = require('puppeteer');
const axios = require("axios");
const {db} = require("./utils/db");
const {random} = require("@jaspero/utils");
const {countries} = require("./utils/country-list");
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

            const regexImage = /"avatar":{"thumbnails":\[{"url":"(.*?)"/gm.exec(response.data)?.[1];
            let image = "";
            if(regexImage !== undefined) {
                image = regexImage;
            }
            const regexNumberOfVideos = /"videosCountText":{"runs":\[{"text":"(.*?)"}/gm.exec(response.data)?.[1];
            const numberOfVideos = parseInt(regexNumberOfVideos);

            const regexCountry = /"country":{"simpleText":"(.*?)"/gm.exec(response.data)?.[1];
            const country = countries[regexCountry];

            const regexChannelName = /false,"title":{"simpleText":"(.*)"},"avatar"/gm.exec(response.data)?.[1];
            const channelName = regexChannelName;

            // const regexLinks = /"webCommandMetadata":{"url":"https:\/\/www.youtube.com\/(.*?)"/gm.exec(response.data);
            // console.log(JSON.stringify(regexLinks));
            // for(let i = 0; i < regexLinks.length; i++) {
            //     if (regexLinks[i].includes('redirect')) {
            //         const links = decodeURIComponent(regexLinks[i].split('u0026q=')[1]);
            //         console.log(links);
            //     }
            // }



            let channelDescription = "";
            const regexDescription = /{"description":{"simpleText":"(.*?)""/gm.exec(response.data)?.[1];
            if(regexDescription !== undefined) {
                channelDescription = regexDescription.split('}')[0];
            }

            const regexCreationDate = /{"text":"Korisnik se pridružio "},{"text":(.*)"}]},"ca/gm.exec(response.data)?.[1];
            const creationDate = regexCreationDate.replace(/"/g, '').replace(/,/g, '');
            const creationDateDay = parseInt(creationDate.split('.')[0]);
            const creationDateMonth = (creationDate.split('.')[1]).split(' ')[1];
            const creationDateYear = (creationDate.split('.')[1]).split(' ')[2];
            const months = ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'];
            const newDate = new Date(`${creationDateYear}-${months.indexOf(creationDateMonth) + 1}-${creationDateDay}`);

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

            const channelId = channel.channel_id;
            const channelUrl = channel.channel_url;
            const data = {
                viewCount: viewCount || 0,
                subscriberCount: subscriberCount || 0,
                channelId,
                channelUrl,
                created_on: newDate,
                channel_name: channelName || "",
                description: channelDescription || "No description",
                channel_number_of_videos: numberOfVideos || 0,
                country: country || "Not defined",
                image_url: image || "No profile image"
            }

            await axios({
                method: 'post',
                url: 'http://192.168.100.201:3000/write-channels-in-db',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    channel_id: data.channelId,
                    channel_url: data.channelUrl,
                    channel_number_of_videos: data.channel_number_of_videos,
                    channel_name: data.channel_name,
                    description: data.description,
                    country: data.country,
                    image_url: data.image_url,
                    created_on: data.created_on,
                    view_count: data.viewCount,
                    subscriber_count: data.subscriberCount,
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
    await downloadChannel(firstChannel, true);
    console.log('Preparation successful');

    const PARALLEL = 5;

    async function parseVideo() {
        const data = await axios({
            method: 'get',
            url: 'http://192.168.100.201:3000/channels-queue',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const channel = data.data;


        console.log('index', channel.skip + 1, channel.channel_id);

        await downloadChannel(channel);


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


