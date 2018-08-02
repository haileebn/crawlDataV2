// const express = require('express');
// const router = express();
const rp = require('request-promise');
const token = '86aef143c4d9a5f182bad4c763f0bd8ebda79dcb343d66f832b2b86a166f7eb39b95089d33853b6d78a4e0f95f72371106ad95154d827f333c88a463fb6b7bda';
const server = "http://118.70.72.15:2223";
const optionsUpdateKit = function(data){
    return {
        method: 'PUT',
        uri: `${server}/kit/${data.KitID}`,
        body: data,
        headers: {
            'content-type': 'application/json; charset=utf-8', // Is set automatically
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
        },
        json: true // Automatically parses the JSON string in the response
    };
};
fakeDataKitFimo();
function fakeDataKitFimo() {
    rp(optionsUpdateKit(fakeRecordOneKit()))
        .then(result => {
            console.log(`update: ${result.message}`);
        });
}
function fakeRecordOneKit() {
    const data = {
      token,
      KitID: 852,
      Name: 'sygs19320601',
      Location: [23.099,121.378],
      outdoor: false,
      locationType: 1
    };
    return data;
}
