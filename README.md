<p align="center">
  <br />
  <img src="https://raw.githubusercontent.com/artnotfound/twitter-classic/master/classic.png" />
</p>

# Twitter Classic

Chrome extension that forces twitter.com into "classic mode", which removes Promoted Tweets & the Moments tab
while ensuring your timeline is ordered from newest to oldest, no algorithms!

<p align="center" style="margin-bottom: -20px;">
  <br />
  <img width="600" src="https://raw.githubusercontent.com/artnotfound/twitter-classic/master/classic.gif" />
</p>

<!---
## Download

Install via the Chrome Store [here](www.googleplaystorelink.com).
-->

## Motivation

Upon hearing the news that Twitter may start introducing algorithm-based feeds I immediately started looking into
a work-around. I noticed Twitter includes the raw unix timestamp of tweets in an HTML data attribute, which allows 
us to read the DOM for the reverse chronological order. After a day spent hacking at Twitter with jQuery, I 
was left with this. While this solution only works for the desktop Chrome browser, I hope it will inspire developers 
of other platforms to explore chronological fixes in case Twitter goes full-blown algo.

## Usage

By default, "auto classic" mode will be enabled. You don't have to do anything except load Twitter and the extension 
will correct any abnormalities. Click the Twitter Classic button to toggle the extension on / off.

<!---
Set 'debug' mode to enable console output. You can get to the developer console in Chrome by going to `View` > `Developer` > `JavaScript Console`.
-->

### Keybindings

`Shift` + `S`: Shuffles your timeline randomly. Useful for testing the sorting functionality or as a glimpse into the future of algo Twitter.

`Shift` + `C`: Sorts your timeline from newest to oldest.

> _NOTE: These are mainly used for testing & are not optimized for performance_

## Dev Usage

Download this repository and follow the instructions [here](https://developer.chrome.com/extensions/getstarted#unpacked) to set up a local extension.

## Notes:

* Extension only runs on twitter.com's main page if you're logged in
* If Twitter does go full algo, they will probably include tweets from various times, meaning the time gaps between tweets may be odd even after being sorted.
* Post-algorithm Retweets will never truely be accurately sorted. This is because Twitter only exposes the retweeted tweets original timestamp,
as opposed to when it was retweeted into your timeline. In cases of retweets, we assume its older than the tweet before it, which may or
not be 100% accurate but doesnt really ruin the flow of the timeline in my opinion.
* This is the first Chrome extension ive made and its good ol fashion jQuery spaghetti  `¯\_(ツ)_/¯`
* Twitter adds a shit load of stuff to the DOM. jc.

## Contributing:
  * PLEASE.
