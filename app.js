'use strict';


let express             = require('express');
let app                 = express();
let cookieParser        = require('cookie-parser');
let bodyParser          = require('body-parser');
let session             = require('express-session');
let conf                = require('config');

let passport            = require('passport');
let TwitterStrategy     = require('passport-twitter').Strategy;
let FacebookStrategy    = require('passport-facebook').Strategy;
let GoogleStrategy      = require('passport-google-oauth').OAuth2Strategy;
let GitHubStrategy      = require('passport-github').Strategy;
let LinkedInStrategy    = require('passport-linkedin').Strategy;

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

// app.set('APP_CONSUMER_KEY', conf.google.dev.key);
// app.set('APP_CONSUMER_SECRET', conf.google.dev.secret);

// 開発環境・本番環境の引数変更
if (app.get('env') === 'development') {
    app.set('TWITTER_CONSUMER_KEY', conf.twitter.dev.key);
    app.set('TWITTER_CONSUMER_SECRET', conf.twitter.dev.secret);
    app.set('FACEBOOK_CONSUMER_KEY', conf.facebook.dev.key);
    app.set('FACEBOOK_CONSUMER_SECRET', conf.facebook.dev.secret);
    app.set('GOOGLE_CONSUMER_KEY', conf.google.dev.key);
    app.set('GOOGLE_CONSUMER_SECRET', conf.google.dev.secret);
    app.set('GITHUB_CONSUMER_KEY', conf.github.dev.key);
    app.set('GITHUB_CONSUMER_SECRET', conf.github.dev.secret);
    app.set('LINKEDIN_CONSUMER_KEY', conf.linkedin.dev.key);
    app.set('LINKEDIN_CONSUMER_SECRET', conf.linkedin.dev.secret);
}
else {
    app.set('TWITTER_CONSUMER_KEY', conf.twitter.public.key);
    app.set('TWITTER_CONSUMER_SECRET', conf.twitter.public.secret);
    app.set('FACEBOOK_CONSUMER_KEY', conf.facebook.public.key);
    app.set('FACEBOOK_CONSUMER_SECRET', conf.facebook.public.secret);
    app.set('GOOGLE_CONSUMER_KEY', conf.google.public.key);
    app.set('GOOGLE_CONSUMER_SECRET', conf.google.public.secret);
    app.set('GITHUB_CONSUMER_KEY', conf.github.public.key);
    app.set('GITHUB_CONSUMER_SECRET', conf.github.public.secret);
    app.set('LINKEDIN_CONSUMER_KEY', conf.linkedin.public.key);
    app.set('LINKEDIN_CONSUMER_SECRET', conf.linkedin.public.secret);
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
    (accessToken, refreshToken, profile, done)=> {
        process.nextTick( ()=> {
            return done(null, profile);
        });
    }
));

passport.use(new GitHubStrategy({
        clientID: app.get('GITHUB_CONSUMER_KEY'),
        clientSecret: app.get('GITHUB_CONSUMER_SECRET'),
        callbackURL: DEFAULT_URL + '/auth/github/callback'
    },
    (accessToken, refreshToken, profile, done)=> {
        return done(null, profile);

        // User.findOrCreate({ githubId: profile.id }, (err, user)=> {
        //     return done(err, user);
        // });
    }
));


passport.use(new LinkedInStrategy({
        consumerKey: app.get('LINKEDIN_CONSUMER_KEY'),
        consumerSecret: app.get('LINKEDIN_CONSUMER_SECRET'),
        callbackURL: DEFAULT_URL + '/auth/linkedin/callback'
    },
    (token, tokenSecret, profile, done)=> {

        return done(null, profile);

        // User.findOrCreate({ linkedinId: profile.id }, (err, user)=> {
        //     return done(err, user);
        // });
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
        // let user = req.user;
        // let provider = req.user.provider;
        res.send(req.user);
        console.log(req.user.id);
        console.log(req.user.displayName);
        console.log(req.user.provider);

        // // SNSごとの判別
        // if (provider === 'twitter') {
        //     console.log(req.user.username);
        // }
        // else if (provider === 'facebook') {

        // }
        // else if (provider === 'google') {

        // }
        // else {

        // }
    }
    else {
        let link = '';
        link += '<a href="/auth/twitter">twitter login</a><br>';
        link += '<a href="/auth/facebook">facebook login</a><br>';
        link += '<a href="/auth/google">google login</a><br>';
        link += '<a href="/auth/github">github login</a><br>';
        link += '<a href="/auth/linkedin">linkedin login</a><br>';
        res.send(link);
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
        "https://www.googleapis.com/auth/plus.login",
        "https://www.googleapis.com/auth/plus.me",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ] }),
    (req, res)=> {
    });

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res)=> {
        res.redirect('/');
    });

// Github認証設定
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res)=> {
        res.redirect('/');
    });


//  LinkedIn認証設定
app.get('/auth/linkedin', passport.authenticate('linkedin'));

// Extended Permissions
// app.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));

app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    (req, res)=> {
        // Successful authentication, redirect home.
        res.redirect('/');
    });




console.log('App running, head to '+ DEFAULT_URL +' to sign in with SNS.');

app.listen(app.get('port'));








