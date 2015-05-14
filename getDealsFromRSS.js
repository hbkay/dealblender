"use strict";

var Q = require('q');
var rsj = require('rsj');
var request = require('request');
var parse5 = require('parse5');
var parser = new parse5.Parser();
var xmlser = require('xmlserializer');
var dom = require('xmldom').DOMParser;
var xpath = require('xpath');
var sanitizeHtml = require('sanitize-html');

var sourceList = [];

// util function
function map (arr, func) {
  return Q().then(function () {
    // inside a `then`, exceptions will be handled in next onRejected
    return arr.map(function (el) { return func(el) })
  }).all() // return group promise
}


// Base class:
// Deal Constructor
var Deal = function (dealInfo) {
  // 1st arg is like the object literal created in parser
  // {
  //   link:         dealsJson[key].link,
  // }
  this.dealInfo = dealInfo;
}

Deal.prototype =  {
  populate: function () {
    var deferred = Q.defer();
    var deal = this;
    var parser = deal.parser;

    setTimeout(function () {
      var options = {
          url: deal.dealInfo.link,
          method: 'GET',
      };

      // ASYNC
      request(options, function (error, response, body) {
        deferred.resolve(parser(deal, body));
      });

    }, 1);

    return deferred.promise;
  }
};


// Base class:
// Source constructor
var Source = function (name, url, dealClass) {
  this.name = name;
  this.url  = url;
  this.dealClass = dealClass;
};

Source.prototype = {
  getDeals: function (callback) {
  },
  getFeedJson: function (callback) {
    var source = this;
    var parser = this.parser;
    
    // ASYNC
    rsj.r2j(this.url, function(json) {
      var feed = JSON.parse(json); // json of the rss feed
      source.feed = feed;
      callback(feed);
    });
  }
};


// Extended Classes:
// -----------
// Slick Deals 
// -----------
var SlickDealsDeal = function (dealInfo) {
  Deal.call(this, dealInfo);
}
SlickDealsDeal.prototype = Object.create( Deal.prototype );

SlickDealsDeal.prototype.parser = function(deal, dealPageHtml) {
  // find new values using xpath and
  // populate new deal object
  var populatedDeal = deal.dealInfo;

  try { 
    var document = parser.parse(dealPageHtml);
    var xhtml = xmlser.serializeToString(document);
    var doc = new dom().parseFromString(xhtml);
    var select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
  } catch (e) {
    console.error(e, populatedDeal.link);
    // parse error. return what we got from rss
    return populatedDeal;
  }

  // title
  var n = select('//*[@id="dealTitle"]/x:h1/text()', doc);
  if (n.length) {
    populatedDeal.title = n[0].toString().replace(/(^\s+|\s+$)/gm,'');
  } else {
    populatedDeal.title = n.toString().replace(/(^\s+|\s+$)/gm,'');
  }

  // price
  var n = select('//*[@id="dealPrice"]/text()', doc);
  if (n.length) {
    populatedDeal.price = n[0].toString().replace(/(^\s+|\s+$)/gm,'');
  } else {
    populatedDeal.price = n.toString().replace(/(^\s+|\s+$)/gm,'');
  }

  // image thumbnail
  var n = select('//*[@id="mainImage"]/@src', doc);
  // var n = select('//*[@class="mainImageContainer"]/x:a/x:img/@src', doc);
  if (n.length) {
    populatedDeal.image = n[0].value;
  } else {
    // n = xpath.select('//*[@class="mainImageContainer"]/*[1]/*[1]');
    // populatedDeal.image = n[0];
    var needle = /<img.+?src=[\"'](.+?)[\"'].*?>/gi; 
    var haystack = populatedDeal.description;
    var matches;
    var images = [];
    while ((matches = needle.exec(haystack)) !== null) {
      images.push(matches[1]);
    }
    populatedDeal.image = images[0];
  }

  // description (n/a)
  populatedDeal.description = sanitizeHtml(populatedDeal.description, {allowedTags: []});


  // dealscore
  populatedDeal.dealscore = select('//*[@role="thread.score"]/text()', doc).toString();

  return populatedDeal;
};

var SlickDealsSource = function () {
  var name  = 'SlickDeals',
      url   = 'http://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1',
      dealClass = SlickDealsDeal;

  Source.call(this, name, url, dealClass);
}
SlickDealsSource.prototype = Object.create( Source.prototype );
SlickDealsSource.prototype.parse = function () {
  var source = this;
  var deferred = Q.defer();
  var deals = [];

  setTimeout(function () {
    for (var key in source.feed) {
      var d = new source.dealClass({
        site:         source.name,
        title:        source.feed[key].title,
        date:         source.feed[key].date,
        link:         source.feed[key].link,
        description:  source.feed[key].description,
      });

      deals.push(d.populate().then(function (deal) {
        return deal;
      }));
    }

    deferred.resolve(deals);

  }, 1);

  return deferred.promise;
}
sourceList.push(SlickDealsSource);



// -----------
// Woot 
// -----------
var WootDeal = function (dealInfo) {
  Deal.call(this, dealInfo);
}
WootDeal.prototype = Object.create( Deal.prototype );

WootDeal.prototype.parser = function(deal, dealPageHtml) {
  // find new values using xpath and
  // populate new deal object
  var populatedDeal = deal.dealInfo;

  try { 
    var document = parser.parse(dealPageHtml);
    var xhtml = xmlser.serializeToString(document);
    var doc = new dom().parseFromString(xhtml);
    var select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
  } catch (e) {
    console.error(e, populatedDeal.link);
    // parse error. return what we got from rss
    return populatedDeal;
  }


  // title (skip)

  //price (see in rss: <woot:price>)
  var n = select('//*[@id="attribute-selector"]/*[2]/*[1]/text()', doc);
  if (n.length) {
    populatedDeal.price = n[0].toString();
  }

  // image (see in rss: woot:thumbnailimage)
  // var n = select('//*[@id="gallery"]/*[1]/*[1]/@src', doc);
  var n = select('//*[@id="gallery"]/x:nav/x:div/x:ul/x:li[1]/x:a/x:img/@src', doc);
  if (n.length) {
    populatedDeal.image = n[0].value;
  }

  // description
  var n = select('//*[@id="tab-features"]/x:article/x:p[1]/text()', doc);
  if (n.length) {
    populatedDeal.description = n[0].toString();
  } 
  populatedDeal.description = sanitizeHtml(populatedDeal.description, {allowedTags: []});

  return populatedDeal;
}

var WootSource = function () {
  var name  = 'woot',
      url   = 'http://api.woot.com/1/sales/current.rss',
      dealClass = WootDeal;

  Source.call(this, name, url, dealClass);
}
WootSource.prototype = Object.create( Source.prototype );
WootSource.prototype.parse = function () {
  var source = this;
  var deferred = Q.defer();
  var deals = [];

  setTimeout(function () {
    for (var key in source.feed) {
      var d = new source.dealClass({
        site:         source.name,
        title:        source.feed[key].title,
        date:         source.feed[key].date,
        link:         source.feed[key].link,
        description:  source.feed[key].description,
        // find price in rss rather than within link page
        price:        source.feed[key]['woot:price']['#']
      });

      deals.push(d.populate().then(function (deal) {
        return deal;
      }));
    }

    deferred.resolve(deals);

  }, 1);

  return deferred.promise;
}
sourceList.push(WootSource);



// -----------
// DealNews
// -----------
var DealNewsDeal = function (dealInfo) {
  Deal.call(this, dealInfo);
}
DealNewsDeal.prototype = Object.create( Deal.prototype );

DealNewsDeal.prototype.parser = function(deal, dealPageHtml) {
  // find new values using xpath and
  // populate new deal object
  var populatedDeal = deal.dealInfo;

  try { 
    var document = parser.parse(dealPageHtml);
    var xhtml = xmlser.serializeToString(document);
    var doc = new dom().parseFromString(xhtml);
    var select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
  } catch (e) {
    console.error(e, populatedDeal.link);
    // parse error. return what we got from rss
    return populatedDeal;
  }


  // title 
  var n = select('//*[@class="article-headline"]/text()', doc);
  if (n.length) {
    populatedDeal.title = n[0].toString();
  } 

  // price 
  var n = select('//*[@class="price price-pop"]/text()', doc);
  if (n.length) {
    populatedDeal.price = n[0].toString().replace(/(^\s+|\s+$)/gm,'');
  }

  // image
  var n = select('//*[@class="art-image"]/*[1]/*[1]/@src', doc);
  if (n.length) {
    populatedDeal.image = n[0].value;
  }

  // description (n/a)
  populatedDeal.description = sanitizeHtml(populatedDeal.description, {allowedTags: []});

  return populatedDeal;
}

var DealNewsSource = function () {
  var name  = 'DealNews',
      url   = 'http://s1.dlnws.com/dealnews/rss/todays-edition.xml',
      dealClass = DealNewsDeal;

  Source.call(this, name, url, dealClass);
}
DealNewsSource.prototype = Object.create( Source.prototype );
DealNewsSource.prototype.parse = function () {
  var source = this;
  var deferred = Q.defer();
  var deals = [];

  setTimeout(function () {
    for (var key in source.feed) {
      // omit rss items w/ 'featured' in url 
      var needle = /\/features\//;
      var haystack = source.feed[key].link;

      if (!needle.test(haystack)) {
        var d = new source.dealClass({
          site:         source.name,
          title:        source.feed[key].title,
          date:         source.feed[key].date,
          link:         source.feed[key].link,
          description:  source.feed[key].description,
        });

        deals.push(d.populate().then(function (deal) {
          return deal;
        }));
      }
    }

    deferred.resolve(deals);

  }, 1);

  return deferred.promise;
}
// sourceList.push(DealNewsSource);


// -----------
// FatWallet
// -----------
var FatWalletDeal = function (dealInfo) {
  Deal.call(this, dealInfo);
}
FatWalletDeal.prototype = Object.create( Deal.prototype );

FatWalletDeal.prototype.parser = function(deal, dealPageHtml) {
  // find new values using xpath and
  // populate new deal object
  var populatedDeal = deal.dealInfo;

  try { 
    var document = parser.parse(dealPageHtml);
    var xhtml = xmlser.serializeToString(document);
    var doc = new dom().parseFromString(xhtml);
    var select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
  } catch (e) {
    console.error(e, populatedDeal.link);
    // parse error. return what we got from rss
    return populatedDeal;
  }


  // title (n/a)
  // var n = select('//*[@class="article-headline"]/text()', doc);
  // if (n.length) {
  //   populatedDeal.title = n[0].toString();
  // } 

  // price (grep from title)
    var needle = /(\$(([1-9]\d{0,2}(,\d{3})*)|(([1-9]\d*)?\d))(\.\d\d)?).*$/gi; 
    var haystack = populatedDeal.title;
    var matches;
    var prices = [];
    while ((matches = needle.exec(haystack)) !== null) {
      prices.push(matches[1]);
    }
    populatedDeal.price = prices[0];

  // image
  var n = select('//*[@class="attachment-preview"]/*[1]/*[@class="lazy"]/@data-original', doc);
  if (n.length) {
    // console.log(n, populatedDeal.link);
    populatedDeal.image = n[0].value;
  }

  // description (skip)
  populatedDeal.description = sanitizeHtml(populatedDeal.description, {allowedTags: []});
  // var n = select('//*[@id="firstPostText"]/x:table/x:tbody/x:tr/x:td[2]/x:div/text()', doc);
  // if (n.length) {
  //   populatedDeal.description = n.toString();
  // } 

  return populatedDeal;
}

var FatwalletSource = function () {
  var name  = 'Fatwallet',
      url   = 'http://www.fatwallet.com/forums/rssfeedburn.php?c=18&deals=10',
      dealClass = FatWalletDeal;

  Source.call(this, name, url, dealClass);
}
FatwalletSource.prototype = Object.create( Source.prototype );
FatwalletSource.prototype.parse = function () {
  var source = this;
  var deferred = Q.defer();
  var deals = [];

  setTimeout(function () {
    for (var key in source.feed) {
      var d = new source.dealClass({
        site:         source.name,
        title:        source.feed[key].title,
        date:         source.feed[key].date,
        link:         source.feed[key].link,
        description:  source.feed[key].description,
      });

      deals.push(d.populate().then(function (deal) {
        return deal;
      }));
    }

    deferred.resolve(deals);

  }, 1);

  return deferred.promise;
}
sourceList.push(FatwalletSource);




// MAIN
var mongoose = require('mongoose');
var db = require('./server/config/database')();
var models = require('./server/config/models');

mongoose.connection.on('connected', function() {
  console.log('✔ MongoDB Connection Success!');

  mongoose.connection.db.dropCollection(models.DealModel.collection.name);

  map(sourceList, function (sourceClass) {
    var deferred = Q.defer();

    var source = new sourceClass();
    source.getFeedJson(function (json) {
      deferred.resolve(source);
    });

    return deferred.promise.then(function (source) {
      return map([source], source.parse.bind(source));
    });
  })
  .then(function (arr) {
    var dealModel = models.DealModel;
    // console.log(dealModel)
    arr = [].concat.apply([], arr);
    var sources = arr;

    // loop through array of sources
    return map(arr, function (sources) {
      return Q.all(sources).then(function (deals) { 
        // loop through array of deals
        return map(deals, function (deal) {
          var deferred = Q.defer();
          setTimeout(function () {
            // console.log(deal);
            // console.log('=========');

            try {
              var d = new dealModel(deal);
              d.save(function (err) {
                if (err) console.error(err);
                deferred.resolve(deal);
              })
            } catch (e) { console.error(e); }

            // deferred.resolve(deal);
          }, 1);

          return deferred.promise;
        })
        .then(function (arg) {
          console.log('specific source done!');
        });
      });

    }); // end (wrapped for 1st map)
  })
  .then(function () {
    console.log("all done!");
    mongoose.disconnect();
  });
});
