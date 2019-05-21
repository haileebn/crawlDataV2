const rp = require(`request-promise`)
const fs = require(`fs`)
const sites = require(`./dsq.json`)
const DSQ = []
sites.forEach(site => {
    if (find({ Latitude: site.Latitude, Longitude: site.Longitude, FullAQSCode: site.FullAQSCode }) === -1)
        DSQ.push({ Latitude: site.Latitude, Longitude: site.Longitude, FullAQSCode: site.FullAQSCode, AgencyName: site.AgencyName })
})
console.log(DSQ.length)

a = 0
DSQ.forEach((item, index) => {
    if (index != 0)
        setTimeout(() => {
            generateID().then(KitID => {
                console.log(KitID)
                item.KitID = KitID
                updateKitID(KitID, item)
            }).then(() => {
                fs.appendFileSync('./result', JSON.stringify(item))
            }).catch(console.log)
        }, index*50)
})

function find(i) {
    let index = -1
    DSQ.forEach((t, ide) => {
        if (i.Latitude === t.Latitude && i.Longitude === t.Longitude && i.FullAQSCode === t.FullAQSCode) {
            index = ide
        }
    })
    return index
}

function generateID() {
    return new Promise((resolve, reject) => {
        rp({
            uri: 'http://auth2.fairnet.vn/kit/generate',
            method: 'post',
            headers: {
                Authorization: '5a5728e5-2dc0-45e2-889c-864faec7855f',
                'content-type': 'application/json; charset=utf-8', // Is set automatically
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
            },
            json: true
        }).then(data => {
            if (data.KitID) {
                resolve(data.KitID)
            } else {
                reject()
            }
        }).catch(reject)
    })
}

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