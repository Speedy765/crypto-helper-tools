
const baseUrl = "http://realtimeNoSupport-919050512.eu-west-1.elb.amazonaws.com/realtimeChart"
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

  // Method to start the poll and schedule it
  this.startPoll = (coin, seconds, cb) => {
    // Initial run
    this.poll(coin, cb)

    // Set the interval to run the poll
    this.interval = setInterval(() => this.poll(coin, cb), seconds * 1000)
  }

  // Method to stop the poll
  this.stopPoll = () => clearInterval(this.interval)

  // These properties store the data from the API
  this.ask = [];
  this.bid = [];
  this.data = [];
  this.labels = [];
  this.diffFromMax = 0;

  // Method that handles the result from the API
  this.handleResult = (result) => {

    this.marketInfo = result;

    this.bid.push(result['Bid']);
    this.ask.push(result['Ask']);

    if (this.bid.length > 60 * 15) {
      this.bid.splice(0,1);
      this.ask.splice(0,1);
    }

    this.data = [this.bid, this.ask];
    this.labels = [];

    var j =  this.bid.length;
    var secondCounter = 0;
    var minuteCounter = 0;
    while (j !== 0) {
      secondCounter++;
      if (secondCounter === "60") {
        minuteCounter++;
        secondCounter = 0;
        this.labels.splice(-1,0, "-" + minuteCounter + "min");
      }
      else {
        this.labels.splice(-1,0, "");
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
        return this.handleResult(res)
      })
      // Invoke the callback with the data needed in the controller
      .then(() => cb({
        data: this.data,
        labels: this.labels,
        diffFromMax: calculateStats(this.bid),
        marketInfo: this.marketInfo
      }));
  }

});
