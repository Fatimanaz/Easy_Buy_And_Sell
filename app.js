var express=require('express');
var app=express();
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var method_override=require('method-override');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
app.locals.moment = require('moment');

//Config
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()) 
app.use(method_override('_method'));
app.use(require("express-session")({
    secret: "anythintg!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});
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
	author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   	createdAt: { type: Date, default: Date.now }
  
});
var item=mongoose.model('Item',ItemSchema);
///		/|\ this keyword is use to create and do otehr things and whatver inside will save the data

var UserSchema = new Schema({
	name : String ,
	userid : String ,
	phoneNumber : Number,
	googleData : Object,
	googleId : Number ,
	createdAt: { type: Date, default: Date.now }
	
});
var User = mongoose.model('User' , UserSchema);
passport.use(new GoogleStrategy({
    clientID: "552553742341-gcpnpa2oqpajueshbrtuverovukc7e37.apps.googleusercontent.com",
    clientSecret: "lzCurWvAeTNNvSGQskLqA14j",
    callbackURL: "https://buysellapp01.run-ap-south1.goorm.io/auth/google/callback",
  },
    function(accessToken, refreshToken, profile, done) {
		if(profile._json.hd === "iitjammu.ac.in"){
			User.findOne({ googleId: profile.id }, function (err, user) {
			   if(err){
				   return done(err);
			   }
			   else{
					if(user){
						console.log("already in db")
						// console.log(user);
						return done(err, user);
					}
					else{
						user = new User({
						    username : `${(profile.name.givenName || "")}`,
							googleData : profile,
							userid : profile.emails[0].value,
							googleId : profile.id 
						});
						user.save(function(err) {
							if (err) {console.log(err);}
						   	console.log(user);
							return done(err, user);
						});
					}
				}   
			});
		}
		else{
			 return done();
		}
        
  }
));
							///IMAGE UPLOAD////
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
							///IMAGE UPLOAD ENDED////


										//ROUTES

//Landing Page
app.get('/',function(req,res){
	res.render('landingpage');
});
// ADDING A NEW ITEM
app.get('/Buysell/new',isLoggedIn, function(req,res){
	res.render('new');
});

// Home Page
app.get('/Buysell',function (req, res){
	  // console.log(req.user);
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
			res.render('home', { items: items,noMatch:noMatch}); 
		} 
	}); 
}); 
//MY PROFILE
app.get('/Buysell/myProfile' , isLoggedIn , function(req , res){
	item.find({},function (err, items){ 
		if (err) { 
			console.log(err); 
		} 
		else { 
			console.log(items);
			res.render('profile', { items: items}); 
		} 
	}); 
});

//Adding  new  item
app.post('/Buysell',isLoggedIn, upload.single('image'), (req, res, next) => { 
  
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
		price:req.body.price,
		author: {
			id: req.user._id,
			username: req.user.googleData.displayName
    	}
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


//SHOW PAGE OF AN ITEM
app.get('/Buysell/item/:id',function(req,res){
	//finding item by  id 
	item.findById(req.params.id,function(err,founditem){
		if(err){console.log('erorr');}
		else{
			res.render('show',{founditem: founditem});
		}
	})
});
//edit item
app.get('/Buysell/item/:id/edit',checkownership,function(req,res){
	item.findById(req.params.id,function(err,founditem){
		res.render('edit_item',{founditem:founditem});
	});
});
//UPDATE ITEM 
app.put('/Buysell/item/:id',checkownership,upload.single('image'),function(req, res, next){ 
  
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
		price:req.body.price,
		author: {
			id: req.user._id,
			username: req.user.googleData.displayName
    	}
    } 
    item.findByIdAndUpdate(req.params.id,obj,function(err, item){ 
        if (err) { 
            res.redirect('/Buysell');
        } 
        else { 
            // item.save(); 
            res.redirect('/Buysell/item/'+req.params.id); 
        } 
    }); 
});
//DELETE ITEM ROUTE
app.delete('/Buysell/item/:id',checkownership,function(req,res){
	item.findByIdAndDelete(req.params.id,function(err){
		if(err){res.redirect('/Buysell');}
		else{
			res.redirect('/Buysell');
		}
	});		
		
});
										//GOOGLE AUTHENTICATION
app.get('/auth/google',
  passport.authenticate('google', {
			scope: [
			'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile' ]
								  }));


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  function(req, res) {
    res.redirect('/Buysell');
  });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// logout route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/Buysell");
});
										//GOOGLE AUTHENTICATION ENDED

											//MIDDLEWARE FUNCTIONS 
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		
        return next();
    }
    res.redirect("/auth/google");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function checkownership(req,res,next){
	if(req.isAuthenticated()){
		item.findById(req.params.id,function(err,founditem){
		if(err){
			console.log(err);
			res.redirect('back');
		}
		else{
			if(founditem.author.id.equals(req.user._id)){
				next();
			}
			else{
				console.log("NOT a author")
			}
		}
		
		});
	}
	else{
		res.redirect('/auth/google');
	}	
}
										//MIDDLEWARE FUNCTIONS  ENDED


//SERVER
app.listen(8000 || process.env.port,function(req,res){
	console.log("Server Has been Started");
});

