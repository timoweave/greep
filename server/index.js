const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const connect_browser_sync = require('connect-browser-sync');
const browser_sync = require('browser-sync');    
const socket_io = require('socket.io');

function make_app(port = 8000) {
    const app = express();
    const http_server = http.Server(app);
    const io = socket_io(http_server);

    use_announcement(io);
    
    app.use(log_request());
    app.use('/node_modules/', static_files('../node_modules/'));
    app.use('/client/', static_files('../client/'));
    app.use('/server/', static_files('../server/'));
    app.get('/', send_index);
    app.use(browser_watch_changes(['../client/*', '../server/*']));
    app.use(send_index); // fall back


    return {app, http_server, io};
}

function log_request() {
    let index = 0;
    return (req, res, next) => {
        const req_index = index++ + ".";
        console.log(req_index, req.method, req.url);
        res.status = function (code) {
            console.log(req_index, code + "");
            this.statusCode = code;
            return this;
        };
        return next();
    };
}

function static_files(sub_path) {
    return express.static(path.join(__dirname, sub_path));
}

function send_index(req, res) {
    const file = path.join(__dirname, '../client/index.html');
    return res.status(200).sendFile(file);
}

function browser_watch_changes(files) {
    const browser_sync_obj = browser_sync.create().init({
        files: files,
        logSnippet: false
    });
    const browser_sync_middleware = connect_browser_sync(browser_sync_obj);
    return browser_sync_middleware;
}

function use_announcement(io) {

    io.on('connection', function(socket) {
        
        console.log('a client is connected');

        socket.on('announcement_channel', function(data) {
            io.emit('announcement_channel', data);
        });

        socket.on('disconnect', function(){
            console.log('a client is disconnected');
        });
    });
}

module.exports = make_app;

if (!module.parent) {
    const port = 8000;
    const { app, http_server, io } = make_app(port);
    http_server.listen(port, () => {
        console.log('app express listen on ' + port);
    });
}
