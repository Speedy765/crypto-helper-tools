const bittrex = require('node.bittrex.api');
var jsonfile = require('jsonfile');
var moment = require("moment");

// Read the config file
var config = jsonfile.readFileSync("config.json");
bittrex.options({
  'apikey' : config.APIKEY,
  'apisecret' : config.APISECRET,
  'stream' : false,
  'verbose' : false,
  'cleartext' : false
});

const BASE_URL = "https://bittrex.com/api/v1.1/market/";

var coins = process.argv[2].split(',');

bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/account/getbalances", function( data ) {

    if (!data.success) {
      return;
    }
    else {
      data.result.forEach(function(balance) {
        // Only get history for the active coins
        if (coins.indexOf(balance.Currency) > -1) {
          bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/account/getorderhistory?market=BTC-" + balance.Currency, function( data ) {
                if (!data.success) {
                  return;
                }
                else {
                  // Find the latest buy order
                  data.result.some(function(order) {
                    if (order.OrderType === "LIMIT_BUY") {
                      var amountBought;
                      var sellPrice = 0;
                      var diff, previousDiff;
                      var buyActive = false;
                      var buyPrice = 0;
                      var maxDiff = -1000;
                      
                      amountBought = order.Quantity
                      buyPrice = order.PricePerUnit;
                      log("Bought " + amountBought + " " + balance.Currency + " for " + buyPrice + " each.");
                      setInterval(function() {
                        bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-" + balance.Currency + "&type=both", function( data ) {
                          // Start to calculate the dump price for the balance
                          var buyQuantity = 0;
                          if (!data.success) {
                            return;
                          }
                          data.result.buy.every(function(buyOrder) {
                            buyQuantity += buyOrder.Quantity;
                            if (buyQuantity >= amountBought) {
                              sellPrice = buyOrder.Rate;
                              return false;
                            }
                            return true;

                          });
                          diff = calculateDiff(buyPrice, sellPrice);
                          // Substract the fees
                          diff -= 0.25;
                          maxDiff = diff > maxDiff ? diff : maxDiff;                          
                          // Only log if it changes
                          if (diff !== previousDiff) {
                            log(balance.Currency + ": New diff of " + diff + "%, max diff is " + maxDiff);
                            previousDiff = diff;
                          }
                        });
                      }, 1000)
                      return true;
                    }
                  });
                  
                }
          }, true);
        }
      })
    }
}, true);

// Small helper function to make a nice console log message
function log(message) {
  console.log("[" + moment().format('DD-MM-YYYY hh:mm:ss') + "] " + message)
}

function calculateDiff(start,end) {
  return Number(((end * 100) / start - 100).toFixed(3));
}