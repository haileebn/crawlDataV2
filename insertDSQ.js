const rp = require('request-promise');
const DSQ = require('./result.json')
const urlDataKit = "http://api.fairnet.vn/data"
const AIRNOW_API_KEY = 'EED17D2E-7206-4FE2-93B3-FD7269013ECB'

for (let i = 6; i < 50; i++) {
    setTimeout(() => {
        console.log(`Start ${i}`)
        getData(i).then(data => {
            data = JSON.parse(data)
            data.forEach((item, index) => {
                const KitID = findDSQ(item.FullAQSCode)
                setTimeout(() => {
                    if (KitID)
                        pushData(KitID, item.Value, i)
                }, index * 50)
            })
        })
    }, (i - 6) * 3 * 60 * 1000)
}


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
    }
}

function getData(i = 0) {
    return rp(`http://www.airnowapi.org/aq/data/?startDate=${genDate(i)}&endDate=${genDate(i)}&parameters=PM25&BBOX=-180,-90,180,90&dataType=C&format=application/json&verbose=1&nowcastonly=0&API_KEY=${AIRNOW_API_KEY}`)
}

function genDate(i = 0) {
    const d = new Date()
    d.setHours(d.getHours() - 8 - i)
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}T${d.getHours()}`
}

function genTime(i = 0) {
    const d = new Date()
    d.setHours(d.getHours() - 1 - i)
    d.setMinutes(0)
    d.setSeconds(0)
    d.setMilliseconds(0)
    return d.getTime()
}

function findDSQ(FullAQSCode) {
    const result = DSQ.filter(a => a.FullAQSCode === FullAQSCode)
    if (result.length > 0)
        return result[0].KitID
    else
        return null
}

function pushData(KitID, PM25, i = 0) {
    const data = { KitID, Sensors: [{ name: 'PMS5003', Time: genTime(i), Data: [0, PM25, 0] }] };
    rp(optionsAddLastDataKit(data))
        .then((response) => {
            console.log(`Done ${KitID}`);
        })
        .catch((err) => {
            console.log("Add Fail");
        });
}