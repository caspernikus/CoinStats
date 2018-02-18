const ChartjsNode = require('chartjs-node');
var request = require('request');
var fs = require('fs');

if (global.CanvasGradient === undefined) {
  global.CanvasGradient = function() {};
}

const coins = [
    'bitcoin',
    'ethereum',
    'ripple',
    'litecoin',
    'cardano',
    'neo',
    'steem'
]

const symbols = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    steem: 'STEEM',
    litecoin: 'LTC',
    ripple: 'XRP',
    cardano: 'ADA',
    neo: 'NEO',
}

const backgroundMapping = {
    bitcoin: 'rgba(255, 99, 132, 0.2)',
    ethereum: 'rgba(54, 162, 235, 0.2)',
    litecoin: 'rgba(123, 201, 237, 0.2)',
    steem: 'rgba(255, 206, 86, 0.2)',
    ripple: 'rgba(75, 192, 192, 0.2)',
    cardano: 'rgba(153, 102, 255, 0.2)',
    neo: 'rgba(255, 159, 64, 0.2)'
}

const borderMapping = {
    bitcoin: 'rgba(255, 99, 132, 1)',
    ethereum: 'rgba(54, 162, 235, 1)',
    litecoin: 'rgba(123, 201, 237, 1)',
    steem: 'rgba(255, 206, 86, 1)',
    ripple: 'rgba(75, 192, 192, 1)',
    cardano: 'rgba(153, 102, 255, 1)',
    neo: 'rgba(255, 159, 64, 1)'
}

init();

function init() {
    var coindata = {};

    var indexUploaded = 0;
    coins.forEach((coin) => {
        getCoinData(coin, function(err, res) {
            if (err !== null) {
                console.log(err);
                return;
            }

            coindata[coin] = {
                data: JSON.parse(res)[0],
                image: null
            };

            getHistoricalData(symbols[coin], function(err, result) {
                if (err !== null) {
                    console.log(err);
                    return;
                }

                const histoday = JSON.parse(result).Data;
                const graphdata = generateGraphData(histoday, coin);
                const timestamp = Date.now();

                createChartImage(coin + timestamp, {
                    labels: getLabels(1440),
                    datasets: [graphdata]
                }, 'line', {width: 1280, height: 800}, function(err, res) {
                    if (err !== null || res === undefined) {
                        console.log('Error: ' + err);
                        return;
                    }

                    const imgURL = JSON.parse(res).message.url;
                    coindata[coin].image = imgURL + '.png';

                    indexUploaded++;
                    if (indexUploaded === coins.length) {
                        var dataset = [];
                        coins.forEach((coin) => {
                            dataset.push({
                                label: coin,
                                data: [coindata[coin].data.market_cap_usd],
                                backgroundColor: [backgroundMapping[coin]],
                                borderColor: [borderMapping[coin]],
                                borderWidth: 1
                            });
                        });
                        createChartImage('overall' + timestamp, {
                            datasets: dataset
                        }, 'bar', {width: 1280, height: 800}, function(err, res) {
                            if (err !== null) {
                                console.log(err);
                                return;
                            }

                            const imgURL = JSON.parse(res).message.url;
                            coindata['overall'] = {
                                image: imgURL + '.png'
                            };

                            generateMarkdown(coindata);
                        });
                    }
                });
            });
        });
    });

}

function getLabels(amount) {
    labels = [];
    for (var i = 0; i < amount; i++) {
        labels.push('');
    }

    return labels;
}

function generateMarkdown(coindata) {
    fs.readFile('templates/main.md', 'utf8', function (err, data) {
      if (err) throw err;

      data = data.replace(/{header}/g, 'CoinStats - Daily Cryptocurrency Statistic Service');
      data = data.replace(/{overall_graph}/g, '![overall_graph]('+ coindata['overall'].image +')');
      data = data.replace(/{date}/g, new Date().toDateString());

      getAllCoins(coindata, function(coins) {
          data = data.replace(/{coins}/g, coins);

          // Write Markdown File
          writeMarkdownFile(data);
      });
    });
}

function writeMarkdownFile(data) {
    fs.writeFile('./out/out.md', data, function(err) {
        if (err) throw err;

        console.log('Markdown generated!');
    });
}

function getAllCoins(coindata, callback) {
    var coinFields = '';
    var indexGenerated = 0;

    coins.forEach((coin) => {
        generateCoinmarkdown(coindata[coin], function(markdown) {
            coinFields += markdown + '  ';

            indexGenerated++;
            if (indexGenerated === coins.length) {
                callback(coinFields);
            }
        });
    });
}

function generateCoinmarkdown(coindata, callback) {
    fs.readFile('templates/coin.md', 'utf8', function (err, data) {
      if (err) throw err;

      data = data.replace(/{coin_name}/g, coindata.data.name);
      data = data.replace(/{coin_graph}/g, '![coin_graph]('+ coindata.image +')');

      data = data.replace(/{name}/g, coindata.data.name);
      data = data.replace(/{symbol}/g, coindata.data.symbol);
      data = data.replace(/{rank}/g, coindata.data.rank);
      data = data.replace(/{price}/g, coindata.data.price_usd);
      data = data.replace(/{change_1h}/g, coindata.data.percent_change_1h);
      data = data.replace(/{change_24h}/g, coindata.data.percent_change_24h);
      data = data.replace(/{change_7d}/g, coindata.data.percent_change_7d);
      data = data.replace(/{more}/g, '[Click here](https://coinmarketcap.com/currencies/'+ coindata.data.id +')');

      callback(data);
    });
}

function generateGraphData(histoData, coin) {
    var data = [];

    histoData.forEach((histo) => {
        data.push(Number(histo.close));
    });

    return {
        label: "24 Hours Value",
        data: data,
        backgroundColor: backgroundMapping[coin],
        borderColor: borderMapping[coin],
        fill: false,
        steppedLine: true,
        pointStyle: 'crossRot'
    };
}

function getCoinData(id, callback) {
    request('https://api.coinmarketcap.com/v1/ticker/' + id, function (error, response, body) {
        callback(error, body);
    });
}

function getHistoricalData(symbol, callback) {
    request('https://min-api.cryptocompare.com/data/histominute?fsym='+symbol+'&tsym=USD&limit=1440&e=CCCAGG', function (error, response, body) {
        callback(error, body);
    });
}

function uploadImageToBlockchain(imageName, callback) {
    setTimeout(function() {
        request.post({url: 'https://spee.ch/api/claim-publish', formData: {name: imageName, file: fs.createReadStream('./img/'+ imageName +'.png')}}, function (error, response, body) {
            callback(error, body);
        });
    }, 60000);
}

function createChartImage(imageName, chartDataSet, chartType, chartSize, callback) {
    const chartNode = new ChartjsNode(chartSize.width, chartSize.height);

    return chartNode.drawChart({
        type: chartType,
        data: chartDataSet,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false,
                        callback: function(value, index, values) {
                            return value.toLocaleString("en-US",{style:"currency", currency:"USD"});;
                        }
                    }
                }]
            }
        }
    })
    .then(() => {
        return chartNode.getImageBuffer('image/png');
    })
    .then(buffer => {
        Array.isArray(buffer) // => true
        // as a stream
        return chartNode.getImageStream('image/png');
    })
    .then(streamResult => {
        // using the length property you can do things like
        // directly upload the image to s3 by using the
        // stream and length properties
        streamResult.stream // => Stream object
        streamResult.length // => Integer length of stream
        // write to a file
        return chartNode.writeImageToFile('image/png', './img/'+ imageName +'.png');
    })
    .then(() => {
        chartNode.destroy();

        // UPLOAD IMAGE TO Spee.ch --> Spee.ch not working
        uploadImageToBlockchain(imageName, function(err, res) {
            callback(err, res);
        });
    });
}
