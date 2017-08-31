# crypto-helper-tools

## Bittrex graphs
Some charts visualizing coins found on www.bittrex.com.
Since they lack:
- Realtime support of prices
- A global overview of the state of all coins in a timespan smaller than 24 hours

I decided to make some nice graphs for myself and the tweakers community and others interested.

## Demo
https://s3-eu-west-1.amazonaws.com/bittrex-reporting-tool/index.html

## Sell script
NodeJS script for monitoring coins and finding optimal sell price. 
Install via ```npm install``` and run via ```node sell.js [coincode(s)]```, for example

```node sell.js ETH```

or

```node sell.js ETH,NEO,LSK```

Don't forget to add your api key in config.json

### Todo
Better readme :-)
