// const express = require('express');
// const router = express();
const rp = require('request-promise');

const server = "http://118.70.72.15:2223";
const urlAllKit = `https://airmap.g0v.asper.tw/json/airmap.json`;
const urlDataKit = "http://118.70.72.15:2223/data";

// const port = process.env.PORT || 2222;

// const address_host = `http://localhost:${port}`;
// const address_host = `http://118.70.72.15:${port}`;

const optionsAllKit = {
        method: 'GET',
        uri: `${server}/kit/all`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
            'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        },
        json: true // Automatically parses the JSON string in the response
    };


const optionsLastRecord = function () {
    // console.log(`https://api.waqi.info/api/widget/@${x}/widget.v1.json`);
    return {
        method: 'GET',
        uri: urlAllKit,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
            'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        },
        json: true // Automatically parses the JSON string in the response
    }
};

const optionsLastRecordHN = function (x) {
    // console.log(`https://api.waqi.info/api/widget/@${x}/widget.v1.json`);
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

const optionsAddLastDataKit = function(data){
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

// router.get('/', (req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.send("Hello!!!");
// });
//
//
// router.get('/all', (req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     let data;
//     res.send("ok");
// });
init();
fakeDataKitFimo();

function init() {
    const data = {
      KitID: "",
      Sensors: [
        {
          name: 'DHT22',
          Time: 0,
          Data: [ 0, 0]
        },
        {
          name: 'PMS5003',
          Time: 0,
          Data: [0, 0, 0]
        },
      ]
    };
    const data2 = {
      KitID: "",
      Sensors: [
        {
          name: 'DHT22',
          Time: 0,
          Data: [ 0, 0]
        },
        {
          name: 'PMS5003',
          Time: 0,
          Data: [0, 0, 0]
        },
      ]
    };
    rp(optionsLastRecord())
        .then(result => {
            // console.log(result);
            result.forEach((kit, index) => {
              setTimeout(() => {
                data.Sensors[0].Time = new Date(kit.Data.Create_at).getTime();
                data.Sensors[1].Time = new Date(kit.Data.Create_at).getTime();
                data["KitID"] = index + 1;
                data.Sensors[1].Data[1] = kit.Data.Dust2_5;
                data.Sensors[0].Data[0] = kit.Data.Temperature;
                data.Sensors[0].Data[1] = kit.Data.Humidity;
                rp(optionsAddLastDataKit(data))
                  .then()
                  .catch((err) => {
                    console.log("Add Fail");
                  });
                if(index === result.length - 1)
                  console.log("\ndone");
            }, index*350)
            });
            // console.log(result.rxs.obs[0].msg.model.timestamp*1000);
        });

    const kitVN = [
        // {
        //     "KitID": 68,
        //     "Name": "8641",
        // },
        {
            "KitID": 772,
            "Name": "1583",
        },
        {
            "KitID": 77,
            "Name": "8688",
        },
        // {
        //     "KitID": 66,
        //     "Name": "8767",
        // }
    ];
    // kitVN.forEach((kitVN) => {
    //   rp(optionsLastRecordHN(kitVN.Name))
    //     .then(lastdata => {
    //       // console.log(typeof kit.Name, kit.Name);
    //       if(lastdata.rxs.obs[0] && lastdata.rxs.obs[0].msg){
    //         data2.Sensors[0].Time = lastdata.rxs.obs[0].msg.timestamp*1000;
    //         data2.Sensors[1].Time = lastdata.rxs.obs[0].msg.timestamp*1000;
    //         lastdata.rxs.obs[0].msg.iaqi.forEach((iaqi, index) => {
    //           data2["KitID"] = kitVN.KitID;
    //           if(iaqi.p === "pm1") data2.Sensors[1].Data[0] = iaqi.v[0];
    //           if(iaqi.p === "pm25") data2.Sensors[1].Data[1] = iaqi.v[0];
    //           if(iaqi.p === "pm10") data2.Sensors[1].Data[2] = iaqi.v[0];
    //           if(iaqi.p === "t") data2.Sensors[0].Data[0] = iaqi.v[0];
    //           if(iaqi.p === "h") data2.Sensors[0].Data[1] = iaqi.v[0];
    //           if(index === lastdata.rxs.obs[0].msg.iaqi.length - 1){
    //             // console.log("Add Success", JSON.stringify(data2), "\n");
    //             // count++;
    //             rp(optionsAddLastDataKit(data2))
    //               .then()
    //               .catch((err) => {
    //                 console.log("Add Fail");
    //               });
    //           }
    //         });
    //       }
    //     });
    // });
    setTimeout(() => {
        init();
    }, 15*60*1000);
}

//
// router.listen(port, () => {
//     console.log(`server: ${address_host}`);
// });

function fakeDataKitFimo() {
  const timeFake = 10;
    rp(optionsAddLastDataKit(fakeRecordOneKit()))
        .then(result => {
            console.log(`(${timeFake}s) Send Data Kit FIMO Message: ${result.message}`);
        });

    setTimeout(() => {
        fakeDataKitFimo();
    }, timeFake*1000);
}

function fakeRecordOneKit() {
    let temp = getRandomInt(20, 40),
        hud = getRandomInt(40, 80);
    const data = {
      KitID: 775,
      Sensors: [
        {
          name: 'DHT22',
          Time: new Date().getTime(),
          Data: [ temp, hud]
        },
        {
          name: 'PMS5003',
          Time: new Date().getTime(),
          Data: [getRandomInt(40, 250), getRandomInt(40, 200), getRandomInt(250, 500)]
        },
      ]
    };
    return data;
}

function getRandomInt(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}
