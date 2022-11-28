const puppeteer = require('puppeteer');
const fs = require("fs");
const axios = require("axios");
const {db} = require("./utils/db");

let browser = null;

async function downloadChannel(channel, procCookies = false) {

    const page = await browser.newPage();

    try {
        await page.setViewport({width: 1200, height: 800});
        await page.goto(channel.channel_url);

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
        const doesntHaveVideos = await page.evaluate(() => {
            return [...document.querySelectorAll('#message')].some(it => it.innerText === 'This channel doesn\'t have any content');
        })
        if (!doesntHaveVideos) {
            await page.evaluate(() => {
                document.querySelector('#video-title').click();
            })
            await page.waitForTimeout(3000);
            const videoUrl = await page.evaluate(() => {
                return document.location.href;
            })


            await page.waitForTimeout(1000);
            await page.goto('view-source:' + videoUrl)
            await page.waitForTimeout(4000);

            const category = await page.evaluate(() => {
                return decodeURIComponent((Array.from(document.documentElement.innerText.matchAll(/"category":"(.*)"/g))[0]?.[1] || '').split('"')[0]);
            });
            await axios({
                method: 'post',
                url: 'http://192.168.100.201:3000/download-category',
                // url: 'http://localhost:3000/download-category',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    channel: channel.channel_id,
                    category: category
                },
            }).then((response) => {
                return response.data;
            });

            await page.close();
        } else{
            await axios({
                method: 'post',
                url: 'http://192.168.100.201:3000/download-category',
                // url: 'http://localhost:3000/download-category',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    channel: channel.channel_id,
                    category: 'none'
                },
            }).then((response) => {
                return response.data;
            });
            await page.close();
        }
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
    console.log('Preparing to download the first channel: ' + firstChannel.channel_id);
    await downloadChannel(firstChannel, true);
    console.log('Preparation successful');


    const PARALLEL = 5;

    async function parseVideo() {
        const data = await axios({
            method: 'get',
            url: 'http://192.168.100.201:3000/get-channel-from-channels',
            // url: 'http://localhost:3000/get-channel-from-channels',
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


