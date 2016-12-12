var url = require('url');
var request = require('request');
var express = require('express');
var app = express();
var path = require('path');
var WebSocketServer = require('ws').Server;
var dataEvent = require('./data-event');

/**
 * whistle会通过请求的头部，把配置的值及是否为https或wss请求传递给插件
 */
var RULE_VALUE_HEADER, SSL_FLAG_HEADER;

//获取 pattern vuedebug://ruleValue的ruleValue
function getRuleValue(req) {
    return decodeURIComponent(req.headers[RULE_VALUE_HEADER] || '');
}

//判断是否是https请求
function isHttps(req) {
    return !!req.headers[SSL_FLAG_HEADER];
}

function getFullUrl(req, ws) {
    var options = url.parse(req.url);
    var proto = ws ? 'ws' : 'http';
    return proto + (isHttps(req) ? 's' : '') + '://' + req.headers.host + options.path;
}

function noop() {
}

function initHttpServer(app) {
    app.use(function (req, res, next) {
        var ruleValue = getRuleValue(req),
            fullUrl = getFullUrl(req),
            jsName = (fullUrl.split('??')[1]).split('.')[0],
            vueJsSourceFile = ruleValue + '/' + jsName + '.js'

        //console.log(ruleValue);
        console.log(vueJsSourceFile);
        dataEvent.emit('data', {url: fullUrl, method: (req.method || 'GET').toUpperCase(), ruleValue: ruleValue});

        var proxy = request(vueJsSourceFile);

        proxy.on('error', function () {
            res.end();
        });

        //request方法返回的对象兼具可读和可写权限，所以可以直接通过pipe给客户端返回值
        req.pipe(proxy).pipe(res);
    });
}

function initWSServer(wss) {
    wss.on('connection', function (ws) {
        var req = ws.upgradeReq;
        var ruleValue = getRuleValue(req);
        dataEvent.emit('data', {url: getFullUrl(req, true), method: 'WEBSOCKET', ruleValue: ruleValue});
        ws.send('Vue Debug ' + ruleValue, noop);
        ws.on('message', function (msg) {
            ws.send('Vue Debug ' + msg, noop);
        });
    });
}

module.exports = function (server, options) {
    RULE_VALUE_HEADER = options.RULE_VALUE_HEADER;
    SSL_FLAG_HEADER = options.SSL_FLAG_HEADER;
    server.on('request', app);
    initHttpServer(app);
    var ws = new WebSocketServer({server: server});
    initWSServer(ws);
};
