const express = require("express");
const bodyParser = require('body-parser')
const chromecasts = require("chromecasts");



var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

var cfg = {
    "port": 8585,
    "devices": devicesDiscover() || []
};

app.all("/", (req, res) => { res.status(404).send("Unauthorized"); });
app.get("/devices", (req, res) => {    
    let status = 200;
    if (!Array.isArray(cfg.devices) || cfg.devices.length <= 0) status = 403;

    res.status(status).send(cfg.devices);
});
app.post("/device/:name/play", (req, res) => {
    //TODO: play to selected real device
    let status = 404;
    let response = { "success": false, "device": undefined, "player": undefined };
    let name = req.params.name; 
    let url = req.body.url || "http://NO_URL";
    let options = {        
        "title": req.body.title || "NO_TITLE",
        "type": req.body.type || "video/mp4",
        "seek": req.body.seek || 5,
        "subtitles": req.body.subtitles || [],
        "autoSubtitles": req.body.autoSubtitles || true
    }
    let device = cfg.devices.filter((device) => { if (device.name === name) return device; })[0];

    if (device) {
        status = 200;
        response.success = true;
        response.device = device.name;        
        response.player = devicePlay(device, url, options) || "NO_MEDIA_DETECTED";        
        console.log(`[chromecast][play]: play object returned ${JSON.stringify(response.player)}`);
    }    
    res.status(status).send(response);
});
app.post("/device/:name/status", (req, res) => {
    //TODO: play to selected real device
    let status = 404;
    let response = { "success": false, "device": undefined, "player": undefined };
    let name = req.params.name;
    let device = cfg.devices.filter((device) => { if (device.name === name) return device; })[0];

    if (device) {
        status = 200;
        response.success = true;
        response.device = device.name;
        response.player = deviceStatus(device) || "NO_MEDIA_DETECTED";
        console.log(`[chromecast][status]: device status it's ${JSON.stringify(response.player)}`);
    }
    res.status(status).send(response);
});

app.listen(cfg.port, () => {
    console.log(`[chromecast][api]: listening at port http://localhost:${cfg.port}`);
});

//TODO: chromecast lib
function devicesDiscover() {
    let devices = [];
    chromecasts().on('update', (player) => {
        console.log(`[chromecast][update]: ${player.name}`)
        devices.push(player);
    });
    return devices;
}

function deviceStatus(device) {    
    let response = undefined;
    device.status((err, player) => {
        if (isError(err)) { response = err; return; }
        response = player;
    });
    return response;
}

function devicePlay(device, url, options) {
    let a =  device.play(url, options, (err, player) => {
        if (isError(err)) { return err; }        
        return player;
    });    
    console.log(`response=${JSON.stringify(a)}`);
}

function isError(err){
    if (err) {
        console.log(`[chromecast][play]: error at play url with options on device, error=${err}`);
        return err;
    }          
}

export default app;
