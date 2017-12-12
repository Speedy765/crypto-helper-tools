# bittrex-sell-aid

## Beta 0.1

## What does it do?

It tracks your current profit/loss in % based on a single buy order on a single coin. In this % the fee is already calculated and your amount of coins is checked for the current dump price in the orderbook.

## Why?

Bittrex does not support trailing stop, now it does!

Fully opensource I do not store your keys anywhere like other sites might do.

# Important

Use at your own risk! Test with small trades first to get a feel for the tool.

## Install

You need to have nodejs install on our system, see https://nodejs.org/en/

### npm

```shell
npm install
```

### Tracking
Add your bittrex keys in the config.json.

This key should have access to `READ INFO`

To start tracking:
```shell
node report-only-multiple.js NEO
```
You can replace `NEO` with any other coin which is tradeable with `BTC` on bittrex.

All you have to do is keep track of the % and dump on bittrex when desired % is reached.

### Trailing stop

You can configure a few options in the `config.json`.

`ALLOWED_PERCENTAGE_DROP_DEFAULT` if the profit is not that big yet, use this percentage to allow drop from top.

`SELL_THRESHOLD_IN_SECONDS` How long a potential sell should last, used to cover small changes.

`STOP_LOSS` Stop loss, do I need to say more?

To start:
```shell
node trailing_stop_one_coin_once.js `NEO`
```

You can replace `NEO` with any other coin which is tradeable with `BTC` on bittrex.

### Contribute

As you can see the source code is right here, feel free to improve the code and submit a pull request.

### Donation
Made some nice profit while you did other stuff? Feel free to donate LTC on `LgmUnUTuUmR5sCKzxvrudFmXXyDHpY5KS7`

### FAQ

Will my funds be locked?

No, since no order is placed until its time to sell. So you can always sell yourself.

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
