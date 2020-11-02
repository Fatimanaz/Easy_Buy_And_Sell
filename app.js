var express=require('express');
var app=express();
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
app.locals.moment = require('moment');

//Config
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()) 


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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



//SERVER
app.listen(3000 || process.env.port,function(req,res){
	console.log("Server Has been Started");
});

