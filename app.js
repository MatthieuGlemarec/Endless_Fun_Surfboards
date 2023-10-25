if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
};

const express = require('express');
const app = express()
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });
const surfboards = require('./routes/surfboards');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


mongoose.connect('mongodb://127.0.0.1:27017/endlessfun', { useNewUrlParser: true })
    .then(() => {
        console.log('MONGO CONNECTION OPEN!')
    })
    .catch(err => {
        console.log('MONGO ERROR!!!!')
        console.log(err)
    });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.User = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.get('/newuser', async (req, res) => {
    const user = new User({ email: 'matthieuglemarec@gmail.com', username: 'bob' });
    const newUser = await User.register(user, 'bob');
    res.send(newUser);
});


app.use('/surfboards', surfboards);

app.get('/', (req, res) => {
    res.render('pages/home')
});

app.get('/shop', (req, res) => {
    res.render('pages/shop')
});
app.get('/contact', (req, res) => {
    res.render('pages/contact')
});

app.get('/admin', (req, res) => {
    res.render('pages/login');
});

app.post('/admin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/admin' }), (req, res) => {
    req.flash('success', 'welcome back!');
    res.redirect('/')
});

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Succesfully logged out, Goodbye!');
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000!!')
});