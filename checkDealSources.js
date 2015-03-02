var rsj = require('rsj');
var mongoose = require('mongoose');
var db = require('./server/config/database')();
var models = require('./server/config/models');

var dealSourceList = [];

// constructor
var DealSource = function (name, url) {
  this.name = name;
  this.url  = url;
};

DealSource.prototype = {
  parser: function (dealsJson) {
    var deals = [];

    for (var key in dealsJson) {
      // find images/thumbs in description
      var needle = /<img.+?src=[\"'](.+?)[\"'].*?>/gi; 
      var haystack = dealsJson[key].description;
      var matches;
      var images = [];
      while ((matches = needle.exec(haystack)) !== null) {
        images.push(matches[1]);
      }

      deals.push({
        title:  dealsJson[key].title,
        price:  '',
        date:   dealsJson[key].date,
        link:   dealsJson[key].link,
        description: dealsJson[key].description,
        images: images,
      });
    }

    return deals;
  },
  getDeals: function (callback) {
    var dealSrc = this;
    var parser = this.parser;
    var deals = this.deals;

    rsj.r2j(this.url, function(json) {
      var feed = JSON.parse(json);

      
      callback(dealSrc, parser(feed));
    });
  }
};


// -----------
var SlickDealsSource = function () {
  var name  = 'Slick Deals',
      url   = 'http://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1';

  DealSource.call(this, name, url);
}
SlickDealsSource.prototype = Object.create( DealSource.prototype );
dealSourceList.push(SlickDealsSource);


// -----------
var DealNewsSource = function () {
  var name  = 'DealNews',
      url   = 'http://s1.dlnws.com/dealnews/rss/todays-edition.xml';

  DealSource.call(this, name, url);
}
DealNewsSource.prototype = Object.create( DealSource.prototype );
dealSourceList.push(DealNewsSource);


// -----------
var FatwalletSource = function () {
  var name  = 'Fatwallet',
      url   = 'http://www.fatwallet.com/forums/rssfeedburn.php?c=18&deals=10';

  DealSource.call(this, name, url);
}
FatwalletSource.prototype = Object.create( DealSource.prototype );
dealSourceList.push(FatwalletSource);


mongoose.connection.on('connected', function() {
  console.log('✔ MongoDB Connection Success!');

  for (var i = dealSourceList.length - 1; i >= 0; i--) {
    var src = new dealSourceList[i]();
    src.getDeals(function (dealSrc, deals) {
      var dealSourceModel = models.DealSource;

      dealSourceModel.find({ name: dealSrc.name }, function (err, results) {
        if (err) throw err;
        console.log("found: " + dealSrc.name);

        if (results.length) {
          results[0].deals = deals;
          results[0].save(function(err) {
            if (err)
              throw err;
          });

          console.log("\tupdated: " + dealSrc.name);

        } else {
          console.log("not found: " + dealSrc.name);

          var source = new dealSourceModel({name: dealSrc.name, deals: deals });
          source.save(function (err) {
            if (!err) {
              console.log("\tcreated " + dealSrc.name);
            } else {
              throw err;
            }
          });

        }
      });
    });
  };
});

