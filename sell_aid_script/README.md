# bittrex-sell-aid

## What does it do?

It tracks your current profit/loss in % based on a single buy order on a single coin. In this % the fee is already calculated and your amount of coins is checked for the current dump price in the orderbook.

## Install

You need to have nodejs install on our system, see https://nodejs.org/en/

### npm

```shell
npm install
```

Add your bittrex keys in the config.json.
This key should have access to `READ INFO`

To start tracking:
```shell
node index.js NEO
```
You can replace `NEO` with any other coin which is tradeable with `BTC` on bittrex.

All you have to do is keep track of the % and dump on bittrex when desired % is reached.

### Donation
Feel free to donate BTC on `1JUoVvQNsmsEJrZLd9ZMMKoSvTJ52tRTG7`
or LTC on `LMYDzpbBjuuJ3tssW9h2XKZy9XoYTpYZsP`


## License

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
