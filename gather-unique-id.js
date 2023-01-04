const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {db} = require('./utils/db');
const knex = require('knex');
let browser = null;


async function downloadChannel(id, procCookies = false, retry = 0) {

    if (!id) {
        return;
    }


    const page = await browser.newPage();


    try {
        await page.setViewport({width: 1200, height: 800});


        await page.goto('https://www.youtube.com/results?search_query=' + id + '&sp=EgIQAg%253D%253D');

        await page.waitForTimeout(2000);

        let cookie = false;
        if (procCookies) {
            try {
                await page.evaluate(() => {
                    document.querySelector('#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.eom-buttons.style-scope.ytd-consent-bump-v2-lightbox > div:nth-child(1) > ytd-button-renderer:nth-child(2) > yt-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill').click();
                });

                cookie = true;
                await page.waitForTimeout(2000);


            } catch (e) {
                console.error('Cookie popup not found', id);
            }

            if (!cookie) {
                try {
                    await page.evaluate(() => {
                        document.querySelector('#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.qqtRac > div.VtwTSb > form:nth-child(3) > div > div > button > div.VfPpkd-RLmnJb').click();
                    });

                    await page.waitForTimeout(2000);
                } catch (e) {
                    console.error('Cookie popup not found', id);
                }
            }
            return;
        }
    } catch (e) {
        console.log('Cookies not found');
    }

    try {
        let dontStop = true;
        while (dontStop) {

            const channelLinks = await page.evaluate(() => {

                return Array.from(document.querySelectorAll('.channel-link.yt-simple-endpoint')).map((item) => {
                    return {
                        url: item.href,
                        name: item.querySelector('ytd-channel-name')?.innerText,
                        number_of_videos: item.querySelector('#video-count')?.innerText
                    };
                }).filter((item) => item.url && item.name && item.number_of_videos);
            });
            for (const channel of channelLinks) {
                const channelId = channel.url.split('/')[channel.url.split('/').length - 1];
                const channelUrl = channel.url;
                const number_of_videos = parseInt(channel.number_of_videos.replace(/,/g, ''));
                await page.evaluate(() => {
                    const retryAmount = 3;

                    function deleteDismissable(index = 0) {

                        const elementChannel = document.querySelector('#content-section');
                        const elementAdd = document.querySelector('#contents > ytd-promoted-video-renderer');

                        const elements = [elementAdd, elementChannel];

                        for (const item of elements) {
                            if (item) {
                                item.remove();
                            } else if (index + 1 < retryAmount) {
                                setTimeout(() => {
                                    deleteDismissable(index + 1);
                                }, 5000);
                            }
                        }
                    }

                    deleteDismissable();
                })


                const data = {
                    channelId,
                    channelUrl,
                    number_of_videos
                };

                await axios({
                    method: 'post',
                    url: 'http://192.168.100.201:3000/write-channels-id-in-db',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        channel_id: data.channelId,
                        channel_url: data.channelUrl,
                        channel_number_of_videos: data.number_of_videos
                    }
                }).then((response) => {
                    return response.data;
                });


            }
            let isThereElem = await page.evaluate(() => {
                return [...document.querySelectorAll('#message')].some(it => it.innerText === 'No more results');
            })
            if (isThereElem) {
                dontStop = false;
            }
        }
        // await page.close();
    } catch
        (e) {
        console.log('error', e);
        await page.close();
    }
    await page.close();
}


async function exec() {

    browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    console.log('Initial setup and accepting cookies');
    await downloadChannel('as', true);
    console.log('Initial setup finished');

    const PARALLEL = 5;
    let retry = 0;

    async function parseVideo() {
        const {skip, word} = await axios({
            method: 'get',
            url: 'http://192.168.100.201:3000/processed-word',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.data;
        });

        if (!word) {
            setTimeout(() => {
                downloadChannel(word);
            }, 5000);
            return;
        }

        console.log('index', skip + 1, word);

        await downloadChannel(word);

        return parseVideo().catch((error) => {
            console.log('Error while parsing video', skip + 1, word, error);
            if (!fs.existsSync('error.log')) {
                fs.writeFileSync('error.log', '');
            }
            fs.appendFileSync('error.log', Date.now() + ' - ' + (skip + 1) + ' - ' + word + ' - ' + (error || '').toString() + '\n');

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


