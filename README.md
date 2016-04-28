# sqljs
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=A8YE92K9QM7NA)

Using NodeJS connect SQL database ([node-mysql](https://github.com/felixge/node-mysql)).
Now support insert method only.

## Usage

I'm using this method to record price of stock by using web scraping.

```javascript
// Dummy data
var moment = require('moment');
var data = [{
	date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
	open: 255,
	high: 255,
	low: 255,
	close: 255,
	name:'ptt'
}];

var sqljs = require('./sql.js');
sqljs.setPool('localhost', 'root', 'username', 'database', 'myport');
sqljs.insert(data, function(){
	sqljs.endPool();
});
```

## Donation
If this project help you reduce time to develop, you can give me a cup of coffee :) 

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=A8YE92K9QM7NA)
