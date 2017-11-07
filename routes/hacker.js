/**
 * Created by achhabra on 11/2/17.
 */
var express = require('express');
var request = require('request');
var async = require('async');

var router = express.Router();

const MAX_TOP_STORIES = 20;

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/top-stories', function (req, res, next) {
    request('https://hacker-news.firebaseio.com/v0/topstories.json', function (error, response, body) {
        // Parse the string to json array
        var top_stories = JSON.parse(body);
        // If the array is not undefined and is not empty take the first 10
        if(top_stories && top_stories != '') {
            top_stories = top_stories.splice(0, MAX_TOP_STORIES);
        }
        // Create prefix for each individual item
        const ITEM_PREFIX = "https://hacker-news.firebaseio.com/v0/item/";
        var urls = [];
        top_stories.forEach(function(elem) {
            urls.push(ITEM_PREFIX + elem + ".json");
        });
        async.map(urls, hacker_news_get_item, function (error, response) {
            if(error) return console.log(error);
            res.header('content-type', 'application/json');
            res.send(response);
        });
    });
});

// make an http request to get each item.
var hacker_news_get_item = function (url, callback) {
    const options = {
        url :  url,
        json : true
    };
    request(options, function(err, res, body) {

        callback(err, hacker_news_prettify_item(body));
    });
}

// get only title and url from the response object.
var hacker_news_prettify_item = function (object) {
    return {
        "title" : object.title,
        "url" : object.url
    };
}

module.exports = router;
