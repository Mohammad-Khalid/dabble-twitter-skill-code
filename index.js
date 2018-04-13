'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var skill = new Alexa.app('tweetstatus');
var TwitterHelper = require('./twitter_helper');
var utterancesMethod = skill.utterances;
skill.utterances = function() {
  return utterancesMethod().replace(/\{\-\|/g, '{');
};

skill.launch(function(request, response) {
  var prompt = 'To tweet your post on twitter timeline, say tweet hello.';
  response.say(prompt).reprompt(prompt).shouldEndSession(false);
});

skill.intent('tweetStatusIntent', {
  'slots': {
    'POSTSTATUS': 'AMAZON.US_FIRST_NAME'
  },
  'utterances': ['tweet {-|POSTSTATUS}']
},
  function(request, response) {
    var accessToken = request.sessionDetails.accessToken;
    if (accessToken === null) {
      //no token, show link account card
      response.linkAccount().shouldEndSession(true).say('Your twitter account is not linked');
      return true;
    } else {
      //i've got a token! make the tweet
      var twitterHelper = new TwitterHelper(request.sessionDetails.accessToken);
      var postStatus = request.slot('POSTSTATUS');
      if (_.isEmpty(postStatus)) {
        var prompt = 'i didn\'t have data for twit ';
        response.say(prompt).send();
      } else {
       twitterHelper.postTweet(postStatus).then(
          function(result) {
            response.say('I\'ve posted the status to your timeline').send();
          }
        );
        return false;
      }
    }
  });
module.exports = skill;
