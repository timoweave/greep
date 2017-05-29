const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const connect_browser_sync = require('connect-browser-sync');
const browser_sync = require('browser-sync');
const socket_io = require('socket.io');
const body_parser = require('body-parser');
const serve_static = require('serve-static');
const restify_mongoose = require('restify-mongoose');
const restify = require('express-restify-mongoose');
const mongoose = require('mongoose');

const models = require('./models.js');

module.exports = {
    init_app, init_aux, init_socketio,
    run_app, static_files, watch_changes, restify_models,
    send_index, send_index2,
    log_request, post_announcement
};

if (!module.parent) {
    run_app();
}

// functions

function run_app(port = process.env.PORT||8000) {
    const app = init_app();
    const { http_app, io } = init_aux(app);

    app.use(send_index); // fall back

    // mongoose.connect('mongodb://localhost:27017/database');

    http_app.listen(port, () => {
        console.log('app express listen on ' + port);
    });
    return {app, http_app, io};
}

function init_app(app = null) {
    if (!app) {
        app = express();
    }

    app.use(body_parser.urlencoded({ extended: false }));
    app.use(body_parser.json());

    app.use(log_request(0));
    app.use('/node_modules/', static_files('../node_modules/', { maxAge: 86400000 }));
    app.use('/client/', static_files('../client/'));
    app.use('/server/', static_files('../server/'));
    app.get('/', send_index);    

    return app;
}

function restify_models(models) {

    const opt = {prefix : '/api', version : '/v1', totalCountHeader : true };
    const router = express.Router();
    restify.serve(router, models.authors, opt);
    restify.serve(router, models.ident, opt);
    restify.serve(router, models.skip, opt);
    restify.serve(router, models.condition, opt);
    restify.serve(router, models.optional, opt);
    restify.serve(router, models.additional, opt);
    restify.serve(router, models.dsig_details, opt);
    restify.serve(router, models.dsig, opt);
    return router;
}

function init_aux(app) {

    const changes = watch_changes(['../client/*', '../server/*']);
    const apis = restify_models(models);
    const http_app = http.Server(app);
    const io = socket_io(http_app);

    app.use(changes);
    app.use(apis);
    app.post('/announcement', post_announcement(io));
    init_socketio(io);
    return { http_app, io };
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

function static_files(sub_path, opt={}) {
    const dir = process.env.PWD;
    return serve_static(path.join(dir, sub_path), opt);
}

function send_index(req, res) {
    const dir = process.env.PWD;
    const file = path.join(dir, '../client/index.html');
    return res.status(200).sendFile(file);
}

function send_index2(req, res) {
    const dir = process.env.PWD;
    const file = path.join(dir, '../client/index2.html');
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

function init_socketio(io) {
    io.on('connection', function(socket) {

        socket.on('announcement_channel', function(data) {
            io.emit('announcement_channel', data);
        });

        socket.on('disconnect', function(){
            // console.log('a client is disconnected');
        });
    });
}
