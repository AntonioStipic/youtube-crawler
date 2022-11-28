const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {db} = require("./utils/db");

let browser = null;

async function downloadChannel(channel, procCookies = false) {


    const page = await browser.newPage();

    try {
        await page.setViewport({width: 1200, height: 800});
        await page.goto(channel.channel_url + '/about');

        await page.waitForTimeout(4000);

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
        await page.waitForTimeout(4000);
        const description = await page.evaluate(() => {
            const content = document.querySelector('#description-container').innerHTML;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(content, "text/html");
            return xmlDoc.querySelector('#description').innerHTML;
        });

        const details = await page.evaluate(() => {
            const detailsText = document.querySelector('#details-container > table > tbody > tr:nth-child(2) > td:nth-child(2) > yt-formatted-string').innerHTML;
            if (detailsText.startsWith('<')) {
                return;
            } else {
                return detailsText;
            }
        });

        const createdOn = await page.evaluate(() => {
            const date = document.querySelector('#right-column > yt-formatted-string:nth-child(2) > span:nth-child(2)').innerText;
            return new Date(date).getTime();
        });

        const numOfChannelViews = await page.evaluate(() => {
            const str = document.querySelector('#right-column > yt-formatted-string:nth-child(3)').innerHTML;
            return parseInt(str.replace(/,/g, ''));
        });

        const channelName = await page.evaluate(() => {
            return document.querySelector('#text').innerText;
        });

        const subscriberCountString = await page.evaluate(() => {
            return document.querySelector('#subscriber-count').innerText;
        });
        const subscriberCountNumber = parseFloat(subscriberCountString.split(' ')[0]);
        const subscriberCountMultiplier = subscriberCountString.split(' ')[0].slice(-1);
        let subscriberCount = subscriberCountNumber;
        switch (subscriberCountMultiplier) {
            case 'K':
                subscriberCount *= 1000;
                break;
            case 'M':
                subscriberCount *= 1_000_000;
                break;
            case 'B':
                subscriberCount *= 1_000_000_000;
                break;
            default:
                break;
        }


        const links = await page.evaluate(() => {
            const content = document.querySelector('#link-list-container').innerHTML;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(content, "text/html");
            return Array.from(xmlDoc.querySelectorAll('.yt-simple-endpoint.style-scope.ytd-channel-about-metadata-renderer')).map((item) => {
                return {
                    url: item.href,
                    label: item.innerText.trim()
                };
            })
        });
        const channelId = channel.channel_id;
        const channelUrl = channel.channel_url;
        const number_of_videos = channel.channel_number_of_videos
        const data = {
            channelId,
            channelUrl,
            channelName,
            numOfChannelViews,
            subscriberCount,
            createdOn,
            description,
            links,
            details,
            number_of_videos
        };

        await axios({
            method: 'post',
            url: 'http://192.168.100.201:3000/write-channels-in-db',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                channel_id: data.channelId,
                channel_url: data.channelUrl,
                channel_name: data.channelName,
                num_of_channel_views: data.numOfChannelViews,
                subscriber_count: data.subscriberCount,
                created_on: new Date(data.createdOn),
                description: data.description,
                links: data.links,
                details: data.details,
                channel_number_of_videos: data.number_of_videos
            }
        }).then((response) => {
            return response.data;
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
        channel_id: '%C3%82MNH%E1%BA%A0CCHUY%E1%BB%82NH%C3%93AT%C3%82MTH%E1%BB%A8C',
        channel_url: 'https://www.youtube.com/c/%C3%82MNH%E1%BA%A0CCHUY%E1%BB%82NH%C3%93AT%C3%82MTH%E1%BB%A8C'
    }
    console.log('Preparing to download the first channel: ' + firstChannel.id);
    await downloadChannel(firstChannel, true);
    console.log('Preparation successful');


    const PARALLEL = 5;
    let retry = 0;

    async function parseVideo() {
        const data = await axios({
            method: 'get',
            url: 'http://192.168.100.201:3000/channels-queue',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const channel = data.data;
        if (!channel) {
            setTimeout(() => {
                downloadChannel(channel);
            }, 5000);
        }

        console.log('index', channel.skip + 1, channel.channel_id);

        await downloadChannel(channel);

        return parseVideo().catch((error) => {
            console.log('Error while parsing video', channel, error);
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


