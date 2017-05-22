const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const connect_browser_sync = require('connect-browser-sync');
const browser_sync = require('browser-sync');
const socket_io = require('socket.io');
const body_parser = require('body-parser');

module.exports = {
    init_app, init_aux, init_announcement, init_watches, init_fallback,
    static_files, send_index, watch_changes,
    log_request, post_announcement
};

if (!module.parent) {
    const app = init_app();
    const { http_server, io } = init_aux(app);

    const port = 8000;
    http_server.listen(port, () => {
        console.log('app express listen on ' + port);
    });
}

// functions

function init_app(app = null) {
    if (!app) {
        app = express();
    }

    app.use(body_parser.urlencoded({ extended: false }));
    app.use(body_parser.json());

    app.use(log_request(0));
    app.use('/node_modules/', static_files('../node_modules/'));
    app.use('/client/', static_files('../client/'));
    app.use('/server/', static_files('../server/'));
    app.get('/', send_index);    

    return app;
}

function init_watches(app) {
    app.use(watch_changes(['../client/*', '../server/*']));
}

function init_fallback(app) {
    app.use(send_index); // fall back
}

function init_aux(app) {
    const http_server = http.Server(app);
    const io = socket_io(http_server);

    app.post('/announcement', post_announcement(io));

    init_announcement(io);
    init_watches(app);
    init_fallback(app);

    return { http_server, io };
}

function post_announcement(io) {
    return (req, res) => {
        console.log(req.body);
        const data = req.body;
        io.emit('announcement_channel', data);
        res.status(200).json(data);
    };
}

function log_request(index = 0) {
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

function watch_changes(files) {
    const browser_sync_obj = browser_sync.create().init({
        files: files,
        logSnippet: false
    });
    const browser_sync_middleware = connect_browser_sync(browser_sync_obj);
    return browser_sync_middleware;
}

function init_announcement(io) {

    io.on('connection', function(socket) {
        // console.log('a client is connected');
        socket.on('announcement_channel', function(data) {
            io.emit('announcement_channel', data);
        });

        socket.on('disconnect', function(){
            // console.log('a client is disconnected');
        });
    });
}
