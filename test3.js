async function test() {
    const r1 = await fetch('https://www.barchart.com/futures/quotes/XG*1/futures-prices', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const cookies = r1.headers.get('set-cookie');
    const tokenMatch = cookies ? cookies.match(/XSRF-TOKEN=([^;]+)/) : null;
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
    
    console.log("Token:", token ? "Found" : "Not Found");

    const r2 = await fetch('https://www.barchart.com/proxies/core-api/v1/quotes/get?list=futures.contractInRoot&root=XG&fields=symbol,contractSymbol,lastPrice&limit=100', {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': token,
            'Cookie': cookies,
            'Referer': 'https://www.barchart.com/futures/quotes/XG*1/futures-prices'
        }
    });

    const data = await r2.text();
    console.log(data.substring(0, 500));
}
test();
