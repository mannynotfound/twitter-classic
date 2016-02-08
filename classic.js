// cuter console.logs
function log (str, color) {
  var colors = {
    'twitter': '#0AAAF5',
    'success': '#228b22',
    'error': '#DC143C'
  };

  console.log(
    '%c' + str,
    'background: ' +
    (colors[color] || '#000') +
    '; color: #FFF; font-size: 12px; font-weight: bold; padding: 3px;'
  );
  console.log('');
}

/*
    takes an existing timeline DOM collection and a desired one
    sorted by time or randomly and updates existing collection to match desired
*/
function reorderTimeline (existing, desired, random) {
  log('RE ORDERING TIMELINE!!!! ', 'twitter');
  console.log('EXISTING:');
  console.dir(existing);
  console.log('DESIRED:');
  console.dir(desired);
  console.log('');

  // obligatory global variable: allows us to ignore DOM mutations while re-rendering
  window.makingClassic = true;
  var cleanup = [];
  /*
      inserting + removing at the same time proves to get
      messy, so prepend all the new posts with clones
      and then "clean up" the originals afterwards
  */
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].id !== desired[i].id) {
      existing[i].elem.before(desired[i].elem.clone());
      cleanup.push(existing[i].elem);
    }
  }

  cleanup.forEach(function(c) {
    c.remove();
  });

  window.makingClassic = false;
  setClassic();

  if (random) log('MADE TIMELINE RANDOM !', 'success');
  else log('MADE CLASSIC !', 'success');
}

function sortByTime (array) {
  return array.sort(function(a,b) {
    return -(new Date(a.time).getTime() - new Date(b.time).getTime());
  });
}

function getTimeline (amount) {
  killPromoted();
  var allTweets = [], lastTime = null;

  var streamSelector = '.stream > .stream-items > *';
  if (amount !== 'all') streamSelector += ':not(.sorted-classic)';

  $(streamSelector).each(function() {
    // some stream items have multiple tweets, so only use timestamp of the "original" one
    var ogTweet = $(this).find($('.original-tweet'))[0];
    var id = $(ogTweet).attr('data-tweet-id');
    var timestamp = $(ogTweet).find($('*[data-time-ms]'))[0];
    // bail out if no timestamp
    if (!timestamp) return;
    // timestamp will be a string in an HTML attribute, so parse to a number
    var time = parseInt($(timestamp).attr('data-time-ms'));

    // do some timestamp logic if we havent already sorted tweet
    if (!$(this).hasClass('sorted-classic')) {
      /*
         retweets are special case, as the timestamp included isnt necessarily
         the "retweet" time, in this case we use our last stored time - 1ms, which will
         make it come after the tweet before. If the first tweet in the timeline is a RT,
         we wont have a last stored time so use current time
      */
      if ($(this).find('.js-retweet-text').length) {
        time = lastTime ? lastTime - 1000 : new Date().getTime();
      }
      // sometimes tweets are posted at the exact same time, so subtract 1ms to make up for this
      if (time === lastTime) time -= 1000
      // store time on element
      $(timestamp).attr('data-time-ms', time);
    }

    // store time for reference in next repeat of loop
    lastTime = time;

    /*
       id to compare against when diffing existing vs desired streams,
       elem will gives us a reference point for DOM insertion
       time will be our measure of comparison
       text + prettyTime are just for debugging
    */
    allTweets.push({
      'id': id,
      'elem': $(this),
      'time': time,
      'text': $($(this).find('.original-tweet .tweet-text')[0]).text(),
      'prettyTime': new Date(time)
    });
  });

  return allTweets;
}

/*
   Promoted Tweets have older timestamps than when they appear in your timeline,
   and while we could treat them like retweets, no one really likes promoted tweets
   most of the time so lets just remove them.
*/
function killPromoted () {
  $('.stream > .stream-items > *').each(function() {
    if ($(this).find('.promoted-tweet').length) {
      $(this).remove();
    }
  });
}

function testSorting () {
  killPromoted();
  function shuffleArray (array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  }

  var allTweets = getTimeline('all');
  var shuffledTweets = shuffleArray(allTweets.slice(0));

  reorderTimeline(allTweets, shuffledTweets, true);
}

function isEqual (a, b) {
  var isEqual = true;

  a.forEach(function (item, i) {
    if (item.id !== b[i].id) {
      log('ERR! ILL-SORTED TWEET AT INDEX ' + i.toString(), 'error');
      console.log('EXISTING:');
      console.dir(item);
      console.log('DESIRED:');
      console.dir(b[i]);
      console.log('');
      isEqual = false;
    }
  });

  return isEqual;
}

function setClassic () {
  // if tweets are in correct order then add a
  // "sorted-classic" class to those that dont already have them
  $('.stream > .stream-items > *:not(.sorted-classic)').addClass('sorted-classic');
}

/*
   By default "amount" will be null here, but if we call it with "all"
   it will analyze entire stream dom without filtering out sorted tweets
*/
function makeClassic (amount) {
  var allTweets = getTimeline(amount);
  var sortedTweets = sortByTime(allTweets.slice(0));

  if (!isEqual(allTweets, sortedTweets)) {
    reorderTimeline(allTweets, sortedTweets);
  } else {
    setClassic();
    log('TWEETS IN CORRECT ORDER ... ', 'success');
  }
}

function createKeybindings () {
  var shiftHeld = false;

  $(document).keydown(function(e) {
    if (e.keyCode === 16) shiftHeld = true;
  });

  $(document).keyup(function(e) {
    if (e.keyCode === 16) shiftHeld = false;
    if (e.keyCode === 83 && shiftHeld) {
      testSorting();
    } else if (e.keyCode === 67 && shiftHeld) {
      makeClassic('all');
    }
  });
}

/*
   Bind any DOM insertions/removals in "stream-items" (the timeline),
   determining if tweets were added/removed since we last checked.
*/
function bindStream () {
  var timeout;
  var streamAmount = getStreamCount();

  $('.stream > .stream-items').bind('DOMNodeInserted', function(e) {
    var newStreamAmount = e.currentTarget.childElementCount;
    if (e.target.innerHTML.indexOf('promoted-tweet') > -1) {
      log('REMOVING PROMOTED TWEET', 'error');
      $(e.target).parents('li.stream-item').remove();
      streamAmount++;
      return;
    } else if (window.makingClassic || newStreamAmount === streamAmount) {
      return;
    }
    /*
       If tweets have been added, set a .3s timeout to check order. This
       timeout gets cleared everytime a tweet is added so we only call makeClassic
       after a whole batch gets added (eg: scrolling or clicking new tweets)
    */
    else if (newStreamAmount > streamAmount) {
      log('TWEET ADDED ... ', 'twitter');
      clearTimeout(timeout);
      streamAmount = newStreamAmount;
      timeout = setTimeout(makeClassic, 300);
    }
  });

  $('.stream > .stream-items').bind('DOMNodeRemoved', function(e) {
    var newStreamAmount = e.currentTarget.childElementCount;
    if (newStreamAmount < streamAmount) streamAmount = newStreamAmount;
  });
}

function getStreamCount () {
  return $('.stream > .stream-items > *').length;
}

function init () {
  killPromoted();
  log('TWITTER CLASSIC LOADED WITH ' + getStreamCount().toString() + ' TWEETS', 'twitter');
  makeClassic();
  bindStream();
  createKeybindings();
}

/*
   Some jank that ensures we're on the home page and logged in
   probably can be optimized with chrome.runtime
*/
function isHomepage() {
  var match = /twitter.com(.*)/.exec(window.location.href);
  return (match[1].length <= 1 && $('body').hasClass('logged-in'));
}

function waitForHomePage () {
  if (isHomepage()) return;
  var timeout;

  var check = function () {
    if (isHomepage()) {
      clearInterval(timeout);
      init();
    }
  }

  timeout = setInterval(check, 1000);
}

/*
   fuck up some DOMmas
*/
$(document).ready(function() {
  chrome.runtime.sendMessage({text: "is this thing on?"}, function (enabled) {
    if (!enabled) return;

    $('#global-nav-home').on('click', waitForHomePage);
    if (isHomepage()) init();
  });
});
