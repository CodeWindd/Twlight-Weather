import https from 'https';

const options = {
  hostname: 'www.spc.noaa.gov',
  path: '/api/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(res.statusCode);
    console.log(data);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
