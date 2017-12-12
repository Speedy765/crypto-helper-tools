const bittrex = require('node.bittrex.api');
var jsonfile = require('jsonfile')
// For nice console messages
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

var coin = process.argv[2];

const BASE_URL = "https://bittrex.com/api/v1.1/market/";


var desiredProfitInPercent = 1;

var counter = 0;
var min, avg, spread, bid, ask, diff, maxDiff, previousDiff = 0;
var maxDiff = -1000;
var buyActive = false;
var buyPrice = 0;
var latestAsk, latestBid;
var previousDiff, previousSpread;
var maxLogLength = 60;
var bidLog = [];
var totalDiff = 0;
var maxProfit = 0;
var amountBought;
var bid,ask;
var sellTicker = 0;
var allowedPercentageDrop = config.ALLOWED_PERCENTAGE_DROP_DEFAULT || 0.5;
var sellThresholdInSeconds = config.SELL_THRESHOLD_IN_SECONDS || 5;
var stopLoss = config.STOP_LOSS || -5;

bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/account/getbalances", function( data ) {
      if (!data.success) {
        console.log(data.message);
        return;
      }
      else {
        data.result.forEach(function(balance) {
          // Only trigger for the selection market
          if (balance.Currency === coin) {
            // Get the order history of the coin to find the latest transaction
            bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/account/getorderhistory?market=BTC-" + coin, function( data ) {
                  if (!data.success) {
                    console.log(data.message);
                    return;
                  }
                  else {
                    data.result.some(function(order) {
                      // This is the last buy
                      if (order.OrderType === "LIMIT_BUY") {
                        amountBought = order.Quantity;
                        buyPrice = order.PricePerUnit;
                        log("Bought " + amountBought + " " + coin + " for " + buyPrice + " each.");
                        log("Starting the tracking...")
                        // We the have coin we are allowed to trade, now find the best sell price
                        var sellInterval = setInterval(function() {
                          bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-" + coin + "&type=both", function( data ) {
                            var buyQuantity = 0;
                            var sellPrice = 0;
                            if (!data.success) {
                              console.log(data.message);
                              return;
                            }
                            // Find the price in the orderbook for which we can sell our coins
                            data.result.buy.every(function(buyOrder) {
                              buyQuantity += buyOrder.Quantity;
                              if (buyQuantity >= amountBought) {
                                sellPrice = buyOrder.Rate;
                                return false;
                              }
                              return true;
                            });

                            diff = calculateDiff(buyPrice, sellPrice);
                            // Calculate the fee
                            diff -= 0.25;

                            // Logic to scale the trailing stop
                            if (diff > maxDiff) {
                              maxDiff = diff;
                              if (maxDiff < 3) {
                                allowedPercentageDrop = 0.75;
                              }
                              else if (maxDiff < 10) {
                                allowedPercentageDrop = maxDiff / 2.8;
                              }
                              else if (maxDiff < 15) {
                                allowedPercentageDrop = 4;
                              }
                              else if (maxDiff < 25) {
                               allowedPercentageDrop = 5;
                              }
                            }

                            // Only report if something changed
                            if (diff !== previousDiff) {
                              log("New diff of " + diff + "%, max diff is " + maxDiff + " and using drop of " + allowedPercentageDrop + "%");
                            }

                            // TODO maybe make these configurable
                            if (((diff > 0.25 || maxDiff > 1) && diff > 0.5) && (maxDiff - allowedPercentageDrop) > diff ) {
                              sellTicker++;
                              log("Sell counter at " + sellTicker + " of required " + sellThresholdInSeconds);
                              if (sellTicker > sellThresholdInSeconds) {
                                log("PROFIT Selling " + amountBought + " " + coin + " for " + sellPrice + ", bought for " + buyPrice + ". Which is a " + diff + "% profit. Max diff was " + maxDiff );
                                clearInterval(sellInterval);
                                // Sell the coin 20% below current price to make sure it sells
                                bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/market/selllimit?market=BTC-" + coin + "&quantity=" + amountBought + "&rate=" + sellPrice * 0.8, function( data ) {
                                  if (data.success) {
                                    log("Sell order placed");
                                  }
                                  else {
                                    console.log(data);
                                  }
                                }, true);
                              }

                            }
                            // Stop loss, must be greater than -75 because sometimes bittrex can glitch and return incorrect values
                            else if (diff < stopLoss && diff > -75) {
                              sellTicker++;
                              log("Sell counter at " + sellTicker + " of required " + sellThresholdInSeconds);
                              if (sellTicker > sellThresholdInSeconds) {
                                // Sell 50% below stop loss, it might be crashing fast so get the best market price
                                log("STOP LOSS Selling " + amountBought + " " + coin + " for " + (sellPrice / 2) + ", bought for " + buyPrice + ". Which is a " + diff + "% loss. Max diff was " + maxDiff );
                                clearInterval(sellInterval);
                                bittrex.sendCustomRequest( "https://bittrex.com/api/v1.1/market/selllimit?market=BTC-" + coin + "&quantity=" + amountBought + "&rate=" + sellPrice * 0.8, function( data ) {
                                  if (data && data.success) {
                                    log("Sell order placed");
                                  }
                                  else {
                                    console.log("Error" + data);
                                  }
                                }, true);
                              }
                            }
                            else {
                              sellTicker = 0;
                            }
                            previousDiff = diff;
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

function log(message) {
  console.log("[" + moment().format('DD-MM-YYYY hh:mm:ss') + "] " + message)
}

function calculateDiff(start,end) {
  return Number(((end * 100) / start - 100).toFixed(2));
}
