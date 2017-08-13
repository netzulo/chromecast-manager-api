"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require('body-parser');
var chromecasts = require("chromecasts");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cfg = {
    "port": 8585,
    "devices": devicesDiscover() || []
};
app.all("/", function (req, res) { res.status(404).send("Unauthorized"); });
app.get("/devices", function (req, res) {
    var status = 200;
    if (!Array.isArray(cfg.devices) || cfg.devices.length <= 0)
        status = 403;
    res.status(status).send(cfg.devices);
});
app.post("/device/:name/play", function (req, res) {
    //TODO: play to selected real device
    var status = 404;
    var response = { "success": false, "device": undefined, "player": undefined };
    var name = req.params.name;
    var url = req.body.url || "http://NO_URL";
    var options = {
        "title": req.body.title || "NO_TITLE",
        "type": req.body.type || "video/mp4",
        "seek": req.body.seek || 5,
        "subtitles": req.body.subtitles || [],
        "autoSubtitles": req.body.autoSubtitles || true
    };
    var device = cfg.devices.filter(function (device) { if (device.name === name)
        return device; })[0];
    if (device) {
        status = 200;
        response.success = true;
        response.device = device.name;
        response.player = devicePlay(device, url, options) || "NO_MEDIA_DETECTED";
        console.log("[chromecast][play]: play object returned " + JSON.stringify(response.player));
    }
    res.status(status).send(response);
});
app.post("/device/:name/status", function (req, res) {
    //TODO: play to selected real device
    var status = 404;
    var response = { "success": false, "device": undefined, "player": undefined };
    var name = req.params.name;
    var device = cfg.devices.filter(function (device) { if (device.name === name)
        return device; })[0];
    if (device) {
        status = 200;
        response.success = true;
        response.device = device.name;
        response.player = deviceStatus(device) || "NO_MEDIA_DETECTED";
        console.log("[chromecast][status]: device status it's " + JSON.stringify(response.player));
    }
    res.status(status).send(response);
});
app.listen(cfg.port, function () {
    console.log("[chromecast][api]: listening at port http://localhost:" + cfg.port);
});
//TODO: chromecast lib
function devicesDiscover() {
    var devices = [];
    chromecasts().on('update', function (player) {
        console.log("[chromecast][update]: " + player.name);
        devices.push(player);
    });
    return devices;
}
function deviceStatus(device) {
    var response = undefined;
    device.status(function (err, player) {
        if (isError(err)) {
            response = err;
            return;
        }
        response = player;
    });
    return response;
}
function devicePlay(device, url, options) {
    var a = device.play(url, options, function (err, player) {
        if (isError(err)) {
            return err;
        }
        return player;
    });
    console.log("response=" + JSON.stringify(a));
}
function isError(err) {
    if (err) {
        console.log("[chromecast][play]: error at play url with options on device, error=" + err);
        return err;
    }
}
exports.default = app;
//# sourceMappingURL=app.js.map