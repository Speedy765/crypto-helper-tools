
const baseUrl = "https://realtime.cryptotracky.com/realtimeChart"
// const baseUrl = "http://localhost:1443/realtimeChart";
const coinUrl = (coin) => baseUrl + "?coin=" + coin

const getCoinUrl = (coin) => coinUrl(coin.toUpperCase());

const calculateDiff = (start,end) => {
  return Number(((end * 100) / start - 100).toFixed(1));
}

const calculateStats = (bid) => {
  var max = bid.reduce((a, b) => Math.max(a, b));
  return calculateDiff(bid[bid.length - 1], max);
}

cryptotracky.service('RealtimeService', function($http) {

  // This is where the interval is stored
  this.interval = null

  // Support multiple coins at once
  this.coinLog = {};

  // Method to start the poll and schedule it
  this.startPoll = (coin, seconds, cb) => {
    console.debug("Starting poll for " + coin);
    // Initial run
    this.poll(coin, cb)
    this.coinLog[coin] = {
      ask: [],
      bid: [],
      data: [],
      labels: [],
      diffFromMax: 0
    }
    // Set the interval to run the poll
    this.interval = setInterval(() => this.poll(coin, cb), seconds * 1000)
  }

  // Method to stop the poll
  this.stopPoll = () => clearInterval(this.interval)

  // Method that handles the result from the API
  this.handleResult = (result, coin) => {

    this.coinLog[coin].marketInfo = result;

    this.coinLog[coin].bid.push(result['Bid']);
    this.coinLog[coin].ask.push(result['Ask']);

    if (this.coinLog[coin].bid.length > 60 * 15) {
      this.coinLog[coin].bid.splice(0,1);
      this.coinLog[coin].ask.splice(0,1);
    }

    this.coinLog[coin].data = [this.coinLog[coin].bid, this.coinLog[coin].ask];
    this.coinLog[coin].labels = [];

    var j =  this.coinLog[coin].bid.length;
    var secondCounter = 0;
    var minuteCounter = 0;
    while (j !== 0) {
      secondCounter++;
      if (secondCounter === "60") {
        minuteCounter++;
        secondCounter = 0;
        this.coinLog[coin].labels.splice(-1,0, "-" + minuteCounter + "min");
      }
      else {
        this.coinLog[coin].labels.splice(-1,0, "");
      }
      j--;
    }
  }

  // The actual method that polls the data
  this.poll = (coin, cb) => {
    // Retrieve the data from the backend
    $http.get(getCoinUrl(coin))
      // Fetch the actual result object
      .then(res => res.data && res.data.result ? res.data.result : null)
      .then(res => {
        // Show error if we don't have a result
        if (!res) {
          return console.log('There was an error retrieving results from the backend')
        }
        // Handle the result if we have it data
        return this.handleResult(res, coin)
      })
      // Invoke the callback with the data needed in the controller
      .then(() => cb({
        data: this.coinLog[coin].data,
        labels: this.coinLog[coin].labels,
        diffFromMax: calculateStats(this.coinLog[coin].bid),
        marketInfo: this.coinLog[coin].marketInfo
      }));
  }

});
