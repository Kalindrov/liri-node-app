require("dotenv").config();

var fs = require('fs');
var request = require('request');
var keys = require('./keys.js');
var inquirer = require('inquirer');
var spotify = require('node-spotify-api');
var twitter = require('twitter');

var spotifyClient = new spotify(keys.spotify);
var twitterClient = new twitter(keys.twitter);

// my-tweets
// spotify-this-song
// movie-this
// do-what-it-says

function getTweets() {

  var params = {screen_name: 'sartharon', count:20};

  twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      
      var tweetList = [];

      for (var i = 0; i < tweets.length; i++) {
        var response = tweets[i].text;
        tweetList.push(response);
      }
      console.log(tweetList);
      fs.appendFile('log.txt', tweetList.toString() + "\n", (err) => {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
      });
    }
  }
)};

function getSong(songName) {
  
  spotifyClient.search({ type: 'track', query: songName, limit:1 }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }

    var trackList = [];

    for (var i = 0; i < data.tracks.items.length; i++) {
      var songInfo = {
        "Artists(s)" : data.tracks.items[i].artists[0].name,
        "Track" : data.tracks.items[i].name,
        "Preview URL" : data.tracks.items[i].preview_url,
        "Album" : data.tracks.items[i].album.name
      };
      trackList.push(songInfo);
    }
    console.log(trackList);
    fs.appendFile('log.txt', JSON.stringify(trackList) + "\n", (err) => {
      if (err) {
        return console.log('Error occurred: ' + err);
      }
    });
  });
}

function getMovie(movieName) {
  
  var noSpace = movieName.replace(' ','+');

  request("http://www.omdbapi.com/?t=" + noSpace + "&apikey=trilogy", function(err, response, body) {
    if (err || response.statusCode !=200) {
      return console.log('Error occurred: ' + err);
    }
      var data = JSON.parse(body);

      var movieInfo = {
        "Title" : data.Title,
        "Year" : data.Year,
        "IMDB Rating" : data.Ratings[0].Value,
        "Rotten Tomatoes Rating" : data.Ratings[1].Value,
        "Country" : data.Country,
        "Language" : data.Language,
        "Plot" : data.Plot,
        "Actors" : data.Actors
      };
      console.log(movieInfo);
      fs.appendFile('log.txt', JSON.stringify(movieInfo) + "\n", (err) => {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
      });
    }
  );
};

function doSomething() {
  fs.readFile('random.txt', 'utf8', function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
      var readStrings = data.split(',');
      var command = readStrings[0];
      var input = readStrings[1];
    
      switch(command) {
        case "Check My Tweets":
          getTweets();
          break;
        case "Spotify This Song":
          getSong(input);
          break;
        case "What Movie Is This?":
          getMovie(input);
          break;
      }
  });
};

inquirer.prompt([
    {
    type: "list",
    message: "What command would you like to run?",
    choices: ["Check My Tweets", "Spotify This Song", "What Movie Is This?", "Do What It Says?"],
    name: "command"
    }
]).then(function(inquirerResponse) {
      if (inquirerResponse.command === "Check My Tweets") {
        console.log(inquirerResponse.command);
        getTweets();
      } else if (inquirerResponse.command === "Spotify This Song") {
        console.log(inquirerResponse.command);
        inquirer.prompt([
          {
          type: "input",
          message: "What song would you like to ask for?",
          name: "song"
          }
        ]).then(function(inquirerResponse) {
          var songName = inquirerResponse.song;
          if (songName == "") {
            songName = "The Sign Ace of Base";
          }
          getSong(songName);
        });
      } else if (inquirerResponse.command === "What Movie Is This?") {
        console.log(inquirerResponse.command);
        inquirer.prompt([
          {
          type: "input",
          message: "What movie would you like to ask for?",
          name: "movie"
          }
        ]).then(function(inquirerResponse) {
          var movieName = inquirerResponse.movie;
          if (movieName == "") {
            movieName = "Mr. Nobody";
          }
          getMovie(movieName);
        });
      } else if (inquirerResponse.command === "Do What It Says?") {
          console.log(inquirerResponse.command);
          doSomething();
      }
      else {
        console.log("\nTry Again Its Broken!\n");
      }
    }
  );

