// const express = require('express');
// const router = express();
const rp = require('request-promise');

const server = "http://api.fairnet.vn";
const urlDataKit = "http://api.fairnet.vn/data";
const US_AQI_URL = "http://www.airnowapi.org/aq/data/?startDate=2018-04-02T00&endDate=2019-05-02T01&parameters=OZONE,PM25,PM10,CO,NO2,SO2&BBOX=105.168171,20.591652,106.453571,21.677848&dataType=A&format=application/json&verbose=0&nowcastonly=0&API_KEY=EED17D2E-7206-4FE2-93B3-FD7269013ECB"

const optionsLastRecord = function () {
    return {
        method: 'GET',
        uri: urlAllKit,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
            'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        },
        json: true
    }
};

const optionsLastRecordHN = function (x) {
    return {
        method: 'GET',
        uri: `https://api.waqi.info/api/feed/@${x}/obs.vn.json`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        },
        // resolveWithFullResponse: true,
        json: true // Automatically parses the JSON string in the response
    }
};

const optionsAddLastDataKit = function (data) {
    return {
        method: 'POST',
        uri: urlDataKit,
        body: data,
        headers: {
            'content-type': 'application/json; charset=utf-8', // Is set automatically
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
        },
        json: true // Automatically parses the JSON string in the response
    };
};
let i = 0


var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./Hanoi_PM2.5_2019_YTD.csv')
});

lineReader.on('line', function (line) {
    i++
    const raw = line.split(',')
    if (parseInt(raw[10]) > 0) {
        let Time = new Date(raw[3], parseInt(raw[4]) - 1, raw[5], raw[6], 0, 0, 0).getTime()
        const data = { KitID: 1078, Sensors: [{ name: 'PMS5003', Time: 0, Data: [0, 0, 0] }] };
        data.Sensors[0].Time = Time;
        data.Sensors[0].Data[1] = parseInt(raw[10]);
        setTimeout(() => {

            rp(optionsAddLastDataKit(data))
                .then((response) => {
                })
                .catch((err) => {
                    console.log(`Add Fail ${i}`, err)
                });
        }, i * 100)
    }
});