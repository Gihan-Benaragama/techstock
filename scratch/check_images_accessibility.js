import { setDefaultResultOrder, setServers } from 'dns';
setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '8.8.4.4']);

import fetch from "node-fetch";

const urls = [
  'https://thfvnext.bing.com/th/id/OIP.h2Bn-CsMDi1Xilpo7CSalQHaHa?w=194&h=194&c=7&r=0&o=7&cb=thfvnextfalcon2&dpr=1.3&pid=1.7&rm=3',
  'https://img.lazcdn.com/g/p/5e1a8ed9842f11ea828b8a311c06d5a5.jpg_720x720q80.jpg',
  'https://cdn.sanity.io/images/yqd1zell/production/700bae21216a026aecc8ae8cee17cfe69e75bd2b-500x500.png',
  'https://cdn.sanity.io/images/yqd1zell/production/b5006a7f0bb420611181e0fbc2cca607f4cf0350-500x500.png',
  'https://cdn.sanity.io/images/yqd1zell/production/dc088ae2308e4c59d258cf985bc711237828b6ca-500x500.png'
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
      console.log(`${url} => Status: ${res.status}`);
    } catch (err) {
      console.log(`${url} => Error: ${err.message}`);
    }
  }
}

check();
