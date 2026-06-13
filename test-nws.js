import https from 'https';

const options = {
  hostname: 'api.weather.gov',
  path: '/exper/mesoanalysis/new/get_sounding.php?lat=35.22&lon=-80.84',
  method: 'GET',
  headers: {
    'User-Agent': 'WeatherAppTest/1.0 (test@example.com)'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
