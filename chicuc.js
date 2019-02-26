const request = require(`request`)
const { MongoClient } = require(`mongodb`) //npm i mongodb@2
const GAS = ['PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3']

MongoClient.connect(`mongodb://127.0.0.1/chicuc`).then(db => {
    run(db)
})

function run(db) {
    getSite().then(sites => {
        sites.forEach(site => {
            GAS.forEach(gas => {
                getDailystat(site.id, gas).then(result => {
                    result.forEach(data => {
                        if (data.value != 0) {
                            let time = strDate(data.time)
                            db.collection(`stat`).findOne({ time, site: site.id, gas }).then(doc => {
                                if (!doc) {
                                    db.collection(`stat`).insertOne({ time, site: site.id, gas, value: data.value })
                                }
                            }).catch(console.log)
                        }
                    })
                }).catch(console.log)

                getDailyaqi(site.id, gas).then(result => {
                    result.forEach(data => {
                        if (data.value != 0) {
                            let time = strDate(data.time)
                            db.collection(`aqi`).findOne({ time, site: site.id, gas }).then(doc => {
                                if (!doc) {
                                    db.collection(`aqi`).insertOne({ time, site: site.id, gas, value: data.value })
                                }
                            }).catch(console.log)
                        }
                    })
                }).catch(console.log)
            })
        })
    }).catch(error => {
        console.log(error)
    })
    setTimeout(() => {
        run(db)
    }, 86400000)
}

function getDailyaqi(site = 14, gas = 'PM2.5') {
    return new Promise((resolve, reject) => {
        request(`http://moitruongthudo.vn/public/dailyaqi/${gas}?site_id=${site}`, (error, header, body) => {
            if (error) {
                reject(error)
            } else {
                try {
                    const data = JSON.parse(body)
                    resolve(data)
                } catch (e) {
                    reject(e)
                }
            }
        })
    })
}

function getDailystat(site = 14, gas = 'PM2.5') {
    return new Promise((resolve, reject) => {
        request(`http://moitruongthudo.vn/public/dailystat/${gas}?site_id=${site}`, (error, header, body) => {
            if (error) {
                reject(error)
            } else {
                try {
                    const data = JSON.parse(body)
                    resolve(data)
                } catch (e) {
                    reject(e)
                }
            }
        })
    })
}

function getSite() {
    return new Promise((resolve, reject) => {
        request(`http://moitruongthudo.vn/api/site`, (error, header, body) => {
            if (error) {
                reject(error)
            } else {
                try {
                    const data = JSON.parse(body)
                    resolve(data)
                } catch (e) {
                    reject(e)
                }
            }
        })
    })
}

function strDate(str) {
    //2018-11-25 00:00
    str = str.split(' ')
    const ngay = str[0].split('-')
    let gio = [0, 0]
    if (str.length === 2) {
        gio = str[1].split(':')
    }
    const date = new Date(ngay[0], ngay[1] - 1, ngay[2], gio[0], 0, 0, 0)
    return date.getTime()
}