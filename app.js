'use strict';


let express = require('express');
let app = express();
let passport = require('passport');
let TwitterStrategy = require('passport-twitter').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let conf = require('config');

let GoogleStrategy      = require('passport-google-oauth').OAuth2Strategy;

app.use(cookieParser());


app.use(bodyParser.urlencoded({extended: true}));


app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true
}));


app.use(passport.initialize());
app.use(passport.session());



app.set('hostname', 'localhost');
app.set('port', 4000);

const DEFAULT_URL = 'http://' + app.get('hostname') + ':' + app.get('port');


// 開発環境・本番環境の引数変更
if (app.get('env') === 'development') {
    app.set('TWITTER_CONSUMER_KEY', conf.twitter.dev.key);
    app.set('TWITTER_CONSUMER_SECRET', conf.twitter.dev.secret);
    app.set('FACEBOOK_CONSUMER_KEY', conf.facebook.dev.key);
    app.set('FACEBOOK_CONSUMER_SECRET', conf.facebook.dev.secret);
    app.set('GOOGLE_CONSUMER_KEY', conf.google.dev.key);
    app.set('GOOGLE_CONSUMER_SECRET', conf.google.dev.secret);
}
else {
    app.set('TWITTER_CONSUMER_KEY', conf.twitter.public.key);
    app.set('TWITTER_CONSUMER_SECRET', conf.twitter.public.secret);
    app.set('FACEBOOK_CONSUMER_KEY', conf.facebook.public.key);
    app.set('FACEBOOK_CONSUMER_SECRET', conf.facebook.public.secret);
    app.set('GOOGLE_CONSUMER_KEY', conf.google.public.key);
    app.set('GOOGLE_CONSUMER_SECRET', conf.google.public.secret);
}




// 認証
passport.use(new TwitterStrategy({
        consumerKey:    app.get('TWITTER_CONSUMER_KEY'),
        consumerSecret: app.get('TWITTER_CONSUMER_SECRET'),
        callbackURL:    DEFAULT_URL + '/auth/twitter/callback'
    },
    (token, tokenSecret, profile, done)=> {
        done(null, profile);
    }
));



passport.use(new FacebookStrategy({
        clientID: app.get('FACEBOOK_CONSUMER_KEY'),
        clientSecret: app.get('FACEBOOK_CONSUMER_SECRET'),
        callbackURL: DEFAULT_URL + '/auth/facebook/callback',
        enableProof: false
    },
    (accessToken, refreshToken, profile, done)=> {
        done(null, profile);

        // User.findOrCreate({ facebookId: profile.id },  (err, user)=> {
        //     return done(err, user);
        // });
    }
));


passport.use(new GoogleStrategy({
        clientID: app.get('GOOGLE_CONSUMER_KEY'),
        clientSecret: app.get('GOOGLE_CONSUMER_SECRET'),
        callbackURL: DEFAULT_URL + '/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));



passport.serializeUser((user, done)=> {
    done(null, user);
});

passport.deserializeUser((user, done)=> {
    done(null, user);
});





// トップ
app.get('/', (req, res)=>{
    if(req.user){
        let user = req.user;
        let provider = req.user.provider;
        res.send(req.user);
        console.log(req.user.id);
        console.log(req.user.displayName);
        console.log(req.user.provider);

        // SNSごとの判別
        if (provider === 'twitter') {
            console.log(req.user.username);
        }
        else if (provider === 'facebook') {

        }
        else {

        }
    }
    else {
        res.send('<a href="/auth/twitter">Twitterにログイン</a><br><a href="/auth/facebook">Facebookにログイン</a><br><a href="/auth/google">Googleにログイン</a>');
    }
});

// Twitter認証設定
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));


// Facebook認証設定
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }),
    (req, res)=> {
        // Successful authentication, redirect home.
        res.redirect('/');
    });


// Google認証設定
app.get('/auth/google',
  passport.authenticate('google', { scope: [
        "https://www.googleapis.com/auth/plus.me",
        "https://www.googleapis.com/auth/plus.login",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });





console.log('App running, head to http://' + app.get('hostname') + ':' + app.get('port') + ' to sign in with Twitter');

app.listen(app.get('port'));








