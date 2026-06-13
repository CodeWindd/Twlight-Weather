import https from 'https';

const prefixes = [
  '/exper/mesoanalysis/s21/',
  '/exper/mesoanalysis/new/',
  '/exper/mesoanalysis/',
  '/exper/soundings/'
];

for (const p of prefixes) {
  https.get('https://www.spc.noaa.gov' + p + 'get_sounding.php?lat=35.22&lon=-80.84', (res) => {
    console.log(p + ' -> ' + res.statusCode);
  });
}
