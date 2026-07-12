fetch('https://www.barchart.com/futures/quotes/XG*1/futures-prices')
  .then(r => r.text())
  .then(t => { 
    const matches = [...t.matchAll(/"symbol":"(XG[A-Z0-9]+)".*?"lastPrice":"([\d\.]+)"/g)]; 
    console.log(matches.map(m => m[1] + ' : ' + m[2]).slice(0, 15)); 
  })
