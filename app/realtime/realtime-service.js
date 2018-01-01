
const baseUrl = "https://realtime.cryptotracky.com/realtimeChart"
// const baseUrl = "http://localhost:1400/realtimeChart";

const calculateDiff = (start,end) => {
  return Number(((end * 100) / start - 100).toFixed(1));
}

const calculateStats = (bid) => {
  var max = bid.reduce((a, b) => Math.max(a, b));
  return calculateDiff(bid[bid.length - 1], max);
}

cryptotracky.service('RealtimeService', function($http) {

  var activeCoins = [];
    // Support multiple coins at once
  var coinLog = {};
  var callBacks = {}

  function getUrl() {
    return baseUrl + "?coins=" + activeCoins.join(",");
  }
  // This is where the interval is stored
  this.interval = null

  // Method to start the poll and schedule it
  this.startPoll = (coin, seconds, cb) => {
    coin = coin.toUpperCase()
    console.debug("Starting poll for " + coin);
    // Add the coin to the list for polling
    activeCoins.push(coin);
    // Initial run
    // this.poll(coin, cb)
    coinLog[coin] = {
      ask: [],
      bid: [],
      data: [],
      labels: [],
      diffFromMax: 0,
      marketInfo: {}
    }
    callBacks[coin] = cb;
    // Set the interval to run the poll
    this.stopPoll();
    this.interval = setInterval(() => this.poll(), seconds * 1000)


  }

  // Method to stop the poll
  this.stopPoll = () => clearInterval(this.interval)

  // Method that handles the result from the API
  this.handleResult = (result, coin) => {

    var coins = Object.keys(result);
    var singleResult;

    coins.forEach(function(coin) {
      singleResult = result[coin];
      coinLog[coin].marketInfo = singleResult;

      coinLog[coin].bid.push(singleResult['Bid']);
      coinLog[coin].ask.push(singleResult['Ask']);

      if (coinLog[coin].bid.length > 60 * 15) {
        coinLog[coin].bid.splice(0,1);
        coinLog[coin].ask.splice(0,1);
      }

      coinLog[coin].data = [coinLog[coin].bid, coinLog[coin].ask];
      coinLog[coin].labels = [];

      var j =  coinLog[coin].bid.length;
      var secondCounter = 0;
      var minuteCounter = 0;
      while (j !== 0) {
        secondCounter++;
        if (secondCounter === "60") {
          minuteCounter++;
          secondCounter = 0;
          coinLog[coin].labels.splice(-1,0, "-" + minuteCounter + "min");
        }
        else {
          coinLog[coin].labels.splice(-1,0, "");
        }
        j--;
      }
      // Invoke the callback with the data needed in the controller
      callBacks[coin]({
        data: coinLog[coin].data,
        labels: coinLog[coin].labels,
        diffFromMax: calculateStats(coinLog[coin].bid),
        marketInfo: coinLog[coin].marketInfo
      });
    });

  }

  // The actual method that polls the data
  this.poll = (cb) => {
    // Retrieve the data from the backend
    $http.get(getUrl())
      // Fetch the actual result object
      .then(res => res.data && res.data.result ? res.data.result : null)
      .then(res => {
        // Show error if we don't have a result
        if (!res) {
          return console.log('There was an error retrieving results from the backend')
        }
        // Handle the result if we have it data
        return this.handleResult(res)
      })
  }

});
