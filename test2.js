fetch('https://www.barchart.com/futures/quotes/XG*1/futures-prices', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(r => r.text()).then(html => {
    // Les données sont injectées dans les attributs HTML: data-ng-init='init({"symbol":"XGN26"...})'
    const matches = [...html.matchAll(/data-ng-init='init\((\{.*?\})\)'/g)];
    const monthlyPrices = {};
    matches.forEach(m => {
        try {
            const data = JSON.parse(m[1]);
            if (data.symbol && data.symbol.startsWith('XG') && data.lastPrice) {
                const price = parseFloat(data.lastPrice.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) {
                    monthlyPrices[data.symbol] = price;
                }
            }
        } catch(e) {}
    });
    console.log("Found prices:", monthlyPrices);
});
