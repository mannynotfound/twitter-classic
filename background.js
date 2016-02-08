chrome.runtime.onInstalled.addListener(function() {
  chrome.browserAction.setBadgeText({text: "ON"});
});

/*
   Basically managing the enabled/disabled state of my extention via the badge
   text. probably trash approach. TODO: research improvement
*/
chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.text === "is this thing on?") {
    chrome.browserAction.getBadgeText({}, function (result) {
      sendResponse(result === 'ON');
    });

    // need this for async callback
    return true;
  }
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.browserAction.getBadgeText({}, function (result) {
    if (result === 'ON') {
      chrome.browserAction.setBadgeText({text: "OFF"});
    } else {
      chrome.browserAction.setBadgeText({text: "ON"});
    }
  })
});
