var express = require('express'),
    path = require('path'),
    http = require('http'),
    fs = require('fs'),
    hjs = require('hjs'),
    shortId = require('shortid'),
    mongoose = require('mongoose'),
    db = (function() {
        mongoose.connect('mongodb://localhost/backmeuponthis');
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function callback() {
            console.log('DB connection open');
        });
    })(),

    schema = mongoose.Schema({
        text: String,
        uri: String
    }),
    Model = mongoose.model('Point', schema);

shortId.seed(687325);

var app = express();

app.set('view engine', 'hjs');

app.configure(function() {
    app.set('port', 8156);

    app.use(express.logger('dev')); /* ''default'', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(path.join(__dirname.substr(0, __dirname.lastIndexOf('/')), 'public')));
});

app.get('/', function(req, res) {
    res.render('index');
    res.end();
});

app.get('favicon.ico', function(req, res) {
    res.end();
});

app.post('/', function(req, res) {
    var uri = shortId.generate();
    console.log(req.body);
    Model.create({
        uri: uri,
        text: req.body.text
    }, function(err, record) {
        res.redirect('/' + uri);
    });

});

app.get('/:uri', function(req, res) {

    Model.findOne({
        uri: req.params.uri
    }, function(err, result) {
        if (result) {
            res.render('backup', {
                text: result.text,
                textAsHtml: result.text.replace(/\n/g, '<br>')
            });
            res.end();
        }
    });
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});