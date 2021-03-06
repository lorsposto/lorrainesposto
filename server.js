require('babel-core/register');

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    async = require('async'),
    match = require('react-router').match,
    React = require('react'),
    ReactDOMServer = require('react-dom/server'),
    RoutingContext = React.createFactory(require('react-router').RoutingContext),
    routes = require('./lorrainesposto/routes');

var mongoose = require('mongoose');

// My things
var Recipe = require('./models/recipe');
var Ingredient = require('./models/ingredient');

var server = express();
var router = express.Router();

var root_dir = path.join(__dirname, 'lorrainesposto');

/*
mongoose.connect('mongodb://localhost/recipes', function (err, db) {
    if (!err) {
        console.log('Connected to mongo');
    }
});

// load fixture
mongoose.connection.once('connected', function () {
    Recipe.count({}, function (err, c) {
        // Count recipes and drop
        if (err) console.log('Error retrieving Recipe count.');
        if (c > 0) {
            console.log('Removing old data from Recipes.');
            Recipe.remove({}, function (err) {
                if (err) console.log('Error removing all from Recipes.');
            });
        }
    });
    Ingredient.count({}, function (err, c) {
        if (err) console.log('Error retrieving Ingredient count.');
        if (c > 0) {
            console.log('Removing old data from Ingredient.');
            Ingredient.remove({}, function (err) {
                if (err) console.log('Error removing all from Ingredient.');
            });
        }
    });

    // read fixture and populate
    fs.readFile('./fixture/fixture.json', function (err, data) {
        if (err) throw err;
        var fix = JSON.parse(data);

        async.forEachOf(fix, function(item, id, cb1) {
            async.forEachOf(item, function(obj, key, cb2) {
                if (key === 'Recipe') {
                    new Recipe(obj).save(function (err) {
                        if (err) {
                            cb2(err);
                        }
                        cb2();
                    });
                }
                else if (key === 'Ingredient') {
                    new Ingredient(obj).save(function (err) {
                        if (err) {
                            cb2(err);
                        }
                        cb2();
                    });
                }
            }, function(err) {
                if (err) {
                    cb1(err);
                }
                cb1();
            });
        }, function(err) {
            if (err) {
                console.log(err);
            }
            console.log("Finished loading data fixture.");
        });
    });
});*/

// view engine setup
server.set('views', path.join(root_dir, 'views'));
server.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(cookieParser());

server.use('/public', express.static(path.join(root_dir, '/public')));
server.use('/images', express.static(path.join(__dirname, 'fixture', 'images')));
//server.use('/public', express.static(path.join(root_dir, 'bower_components')));

server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    match({routes, location: req.url}, (err, redirectLocation, renderProps) => {
        if (err) {
            res.status(500).send(err.message)
        } else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search)
        } else if (renderProps) {
            console.log("Rendering", req.url);
            res.status(200).render('index', {
                reactContent: ReactDOMServer.renderToString(RoutingContext({
                    history: renderProps['history'],
                    location: renderProps['location'],
                    components: renderProps['components'],
                    routes: renderProps['routes'],
                    params: renderProps['params']
                }))
                // dis shit
            });
        } else {
            //res.status(404).send('Not found')
            console.log("404 Not Found:", req.url);
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        }
    });
});

// error handlers

// development error handler
// will print stacktrace
if (server.get('env') === 'development') {
    server.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            title: 'Error',
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
server.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title: 'Error',
        message: err.message,
        error: {}
    });
});

module.exports = server;
