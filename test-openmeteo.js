import https from 'https';

const url = 'https://api.open-meteo.com/v1/forecast?latitude=35.22&longitude=-80.84&hourly=cape,cin,wind_direction_10m,wind_direction_80m,wind_speed_10m,wind_speed_80m';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(res.statusCode);
    const parsed = JSON.parse(data);
    console.log(Object.keys(parsed.hourly));
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
