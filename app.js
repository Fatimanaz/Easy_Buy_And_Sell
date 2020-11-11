var express=require('express');
var app=express();
var bodyParser = require('body-parser');
var mongoose=require('mongoose');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
app.locals.moment = require('moment');

//Config
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()) 

app.use(passport.initialize());
app.use(passport.session());
//DATABASE and SCHEMA SETUP
mongoose.connect('mongodb://localhost:27017/BUYSELLDB',{ useNewUrlParser: true,useUnifiedTopology: true });
var Schema=mongoose.Schema;
var ItemSchema=new Schema({
	name: String, 
    desc: String,
	contact:String,
	email: String,
    img: 
    { 
        data: Buffer, 
        contentType: String 
    },
	category:String,
	price:String,
   	createdAt: { type: Date, default: Date.now }
  
});
var item=mongoose.model('Item',ItemSchema);
///		/|\ this keyword is use to create and do otehr things and whatver inside will save the data

var UserSchema = new Schema({
	name : String ,
	userid : String ,
	phoneNumber : Number,
	googleData : Object,
	createdAt: { type: Date, default: Date.now }
	
});
var User = mongoose.model('User' , UserSchema);
passport.use(new GoogleStrategy({
    clientID: "552553742341-gcpnpa2oqpajueshbrtuverovukc7e37.apps.googleusercontent.com",
    clientSecret: "lzCurWvAeTNNvSGQskLqA14j",
    callbackURL: "https://csp-project-1-llfmm.run-ap-south1.goorm.io/auth/google/callback",
  },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ googleId: profile.id }, function (err, user) {
		   if(err){
			   return done(err);
		   }
		   if(!user){
			   user = new User({
				   username : `${(profile.name.givenName || "")}`,
					googleData : profile,
					userid : profile.emails[0].value
			   })
			   user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
		   }
		   else{
			   return done(err, user);
		   }
         
       });
  }
));

var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 
  
var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
  
var upload = multer({ storage: storage }); 

//ROUTES

// ADDING A NEW ITEM
app.get('/Buysell/new',function(req,res){
	res.render('new');
});

// Home Page
app.get('/Buysell',function (req, res){
	// 	search function
	var noMatch=null;
	 if(req.query.search) {
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
        item.find({name:regex},function (err, items){ 
		if (err) { 
			console.log(err); 
		} 
		else { 
			if(items.length==0) {
                   noMatch = "No Items match that query, please try again.";
            }
			res.render('home', { items: items, noMatch:noMatch }); 
		} 
	}); 
    }
// 	Normal rendering 
	item.find({},function (err, items){ 
		if (err) { 
			console.log(err); 
		} 
		else { 
			res.render('home', { items: items,noMatch:noMatch }); 
		} 
	}); 
}); 

// Uploading the item
app.post('/Buysell', upload.single('image'), (req, res, next) => { 
  
    var obj = { 
        name: req.body.name, 
        desc: req.body.desc, 
		contact: req.body.contact,
		email: req.body.email,
        img: { 
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
            contentType: 'image/png'
        },
		category:req.body.category,
		price:req.body.price
    } 
    item.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            // item.save(); 
            res.redirect('/Buysell'); 
        } 
    }); 
});

//shows more abt one item
app.get('/Buysell/:id',function(req,res){
	//finding item by  id 
	item.findById(req.params.id,function(err,founditem){
		if(err){console.log('erorr');}
		else{
			res.render('show',{founditem: founditem});
		}
	})
	
})
app.get('/auth/google',
  passport.authenticate('google', {
			scope: [
			'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile' ]
								  }));


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/Buysell');
  });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



//SERVER
app.listen(3000 || process.env.port,function(req,res){
	console.log("Server Has been Started");
});

