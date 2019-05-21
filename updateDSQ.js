const rp = require(`request-promise`)
const fs = require(`fs`)
const DSQ = require(`./result.json`)
a = 0
DSQ.forEach((item, index) => {
    if(item.KitID > 1329)
        setTimeout(() => {
            updateSensor(item.KitID).then(() => {
                console.log(`Done ${index}`)
            }).catch(console.log)
        }, index * 500)
})


function updateKitID(KitID, site) {
    return new Promise((resolve, reject) => {
        rp({
            uri: `http://auth2.fairnet.vn/kit/${KitID}`,
            method: 'PUT',
            headers: {
                Authorization: '5a5728e5-2dc0-45e2-889c-864faec7855f',
                'content-type': 'application/json; charset=utf-8', // Is set automatically
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
            },
            body: {
                Name: site.AgencyName,
                Location: [site.Latitude, site.Longitude],
                outdoor: true,
                locationType: 1,
            },
            json: true
        }).then(data => {
            if (!data.error) {
                resolve(data)
            } else {
                reject()
            }
        }).catch(reject)
    })
}

function updateNetworkID(KitID) {
    return new Promise((resolve, reject) => {
        rp({
            uri: `http://auth2.fairnet.vn/kit/${KitID}/network`,
            method: 'PUT',
            headers: {
                Authorization: '5a5728e5-2dc0-45e2-889c-864faec7855f',
                'content-type': 'application/json; charset=utf-8', // Is set automatically
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
            },
            body: {
                networkId: '5ccbb68614739565db1e901f'
            },
            json: true
        }).then(data => {
            if (!data.error) {
                resolve(data)
            } else {
                reject()
            }
        }).catch(reject)
    })
}

function updateSensor(KitID) {
    return new Promise((resolve, reject) => {
        rp({
            uri: `http://auth2.fairnet.vn/kit/${KitID}/sensor`,
            method: 'delete',
            headers: {
                Authorization: '5a5728e5-2dc0-45e2-889c-864faec7855f',
                'content-type': 'application/json; charset=utf-8', // Is set automatically
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
            },
            body: {
                name: 'DHT22'
            },
            json: true
        }).then(data => {
            if (!data.error) {
                resolve(data)
            } else {
                reject()
            }
        }).catch(reject)
    })
}