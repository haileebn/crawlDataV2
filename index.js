// const express = require('express');
// const router = express();
const rp = require('request-promise');
const DSQ = require('./result.json')
const server = "http://api.fairnet.vn";
const urlAllKit = `https://api.airmap.g0v.tw/json/airmap.json`;
const urlDataKit = "http://api.fairnet.vn/data";
const AIRNOW_API_KEY = 'EED17D2E-7206-4FE2-93B3-FD7269013ECB'

const length = 25;
const timeMax = 30; //30s
let MinKitID = 0;
let MaxKitID = MinKitID + length;

const optionsAllKit = {
  method: 'GET',
  uri: `${server}/kit/all`,
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
    'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  },
  json: true
};


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

init();
runUS()
//fakeDataKitFimo();

function init() {
    const data = {KitID: "",Sensors: [{name: 'DHT22',Time: 0,Data: [ 0, 0]},{name: 'PMS5003',Time: 0,Data: [0, 0, 0]},]};
    const data2 = {KitID: "",Sensors: [{name: 'DHT22',Time: 0,Data: [ 0, 0]},{name: 'PMS5003',Time: 0,Data: [0, 0, 0]},]};
    rp(optionsLastRecord())
        .then(result => {
          if (MaxKitID < 1000) {
            for(let index = MinKitID; index < MaxKitID; index++){
              let kit = result[index];
			  if(kit){
              // setTimeout(() => {
                data.Sensors[0].Time = new Date(kit.Data.Create_at).getTime();
                data.Sensors[1].Time = new Date(kit.Data.Create_at).getTime();
                data["KitID"] = index + 1;
                data.Sensors[1].Data[1] = kit.Data.Dust2_5;
                data.Sensors[0].Data[0] = kit.Data.Temperature;
                data.Sensors[0].Data[1] = kit.Data.Humidity;
                rp(optionsAddLastDataKit(data))
                  .then((response) => {
                    // console.log(JSON.stringify({response, index}));
                  })
                  .catch((err) => {
                    console.log(err.message);
                    console.log("Add Fail");
                  });
			  }
                // }, index*50);
            }
          }else {
            MinKitID = 0;
      			MaxKitID = length;
          }
            // console.log(result.rxs.obs[0].msg.model.timestamp*1000);
        });
    setTimeout(() => {
      console.log(`\nGet KitID: [${MinKitID} - ${MaxKitID}]`);
      MinKitID = MaxKitID;
      MaxKitID += length;
      init();
    }, timeMax*1000);
}

function fakeDataKitFimo() {
  const timeFake = 20;
  rp(optionsAddLastDataKit(fakeRecordOneKit()))
    .then(result => {
      console.log(`(${timeFake}s) Send Data Kit FIMO Message: ${result.message}`);
    });

  setTimeout(() => {
    fakeDataKitFimo();
  }, timeFake * 1000);
}

function fakeRecordOneKit() {
  let temp = getRandomInt(20, 40),
    hud = getRandomInt(40, 80);
  const data = {
    KitID: 1001,
    Sensors: [
      {
        name: 'DHT22',
        Time: new Date().getTime(),
        Data: [temp, hud]
      },
      {
        name: 'PMS5003',
        Time: new Date().getTime(),
        Data: [getRandomInt(5, 10), getRandomInt(10, 40), getRandomInt(40, 60)]
      },
    ]
  };
  return data;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


function getData() {
  return rp(`http://www.airnowapi.org/aq/data/?startDate=${genDate()}&endDate=${genDate()}&parameters=PM25&BBOX=-180,-90,180,90&dataType=C&format=application/json&verbose=1&nowcastonly=0&API_KEY=${AIRNOW_API_KEY}`)
}

function genDate() {
  const d = new Date()
  d.setHours(d.getHours() - 8)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}T${d.getHours()}`
}

function genTime() {
  const d = new Date()
  d.setHours(d.getHours() - 1)
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  return d.getTime()
}

function findDSQ(FullAQSCode) {
  const result = DSQ.filter(a => a.FullAQSCode === FullAQSCode)
  console.log(result)
  if (result.length > 0)
    return result[0].KitID
  else
    return null
}

function pushData(KitID, PM25) {
  const data = { KitID, Sensors: [{ name: 'PMS5003', Time: genTime(), Data: [0, PM25, 0] }] };
  rp(optionsAddLastDataKit(data))
    .then((response) => {
      console.log(`Done ${KitID}`);
    })
    .catch((err) => {
      console.log(err.message);
      console.log("Add Fail");
    });
}

function runUS() {
  getData().then(data => {
    data = JSON.parse(data)
    console.log(data.length);
    data.forEach((item, index) => {
      const KitID = findDSQ(item.FullAQSCode);
      setTimeout(() => {
        if (KitID)
          pushData(KitID, item.Value)
      }, index * 500)
    })
  })
  setTimeout(() => {
    runUS()
  }, 60 * 60 * 1000)
}