import https from 'https';

const url = 'https://rucsoundings.noaa.gov/get_soundings.cgi?data_source=RAP&latest=latest&start_year=2026&start_month_name=Jun&start_mday=13&start_hour=16&start_min=0&n_hrs=1.0&fcst_len=shortest&airport=35.22,-80.84&text=Ascii%20text%20%28GSD%20format%29&hydrometeors=false&data=all';

https.get(url, (res) => {
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
