/**
 * Created by achhabra on 11/4/17.
 */

var express = require('express');
var url = require('url');
var request = require('request');

var router = express.Router();

const client_id = 'bb0dc95720ac';
const client_secret = 'ab491e30d863b2ab539cf2a59e5e79a0c486ea82';

// Word that is used to identify the source system.
const state = 'fuck';

/* Authorize user */
router.get('/authorize', function(req, res, next) {
    var req_url = url.parse(req.url, true);
    var code;
    if(req_url.query.error)
        res.send({error: "User did not authorize on Medium"})

    if(req_url.query.state && req_url.query.code && req_url.query.state === state )
        code = req_url.query.code;

    var post_body = {
        form: {
            code: code,
            client_id: client_id,
            client_secret: client_secret,
            grant_type: 'authorization_code',
            redirect_uri:'http://127.0.0.1:8085/medium/authorize'
        }
    }

    // TODO: Fix me !!
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    request.post('https://api.medium.com/v1/tokens', post_body, function(error, response, body) {
        if(error) console.log(error);
        body = JSON.parse(body);
        res.send({
            access_token: body.access_token,
            refresh_token: body.refresh_token
        });
    });
});

/* Get User details */
router.get('/user-info', function(req, res, next) {

    var req_url = url.parse(req.url, true);
    if(!req_url.query.access_token || req_url.query.access_token === '' )
        res.send({error: "Missing access_token"});

    //TODO: Fix me!!
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    request.get('https://api.medium.com/v1/me', {'auth' : {'bearer' : req_url.query.access_token}}, function(error, response, body) {
        if(error) res.send({error: error});
        res.send(body);
    });
});
module.exports = router;