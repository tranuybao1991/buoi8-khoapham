var express  = require('express');
var app = express();

app.use(express.static('public/'));
app.set('view engine', 'ejs');
app.set('views','./views');


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

var server = require('http').Server(app);
server.listen(process.env.PORT || 3000);


var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/image/upload')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
});

var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if( file.mimetype=="image/bmp" || 
            file.mimetype=="image/png" ||
            file.mimetype=="image/jpg" ||
            file.mimetype=="image/jpeg"||
            file.mimetype=="image/gif" 
        ){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("file");

///////////////////////MONGODB//////////////////////////////
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://baotran:YaZp40ePiEyntdod@cluster0-whsld.mongodb.net/buoi8?retryWrites=true&w=majority', {useNewUrlParser: true},
function(err){
        if(err){
            console.log('Server error'+err);
        }else{
            console.log('Connection Suceess');
        }
});

var Cap1 = require('./modules/cap1');
var Cap2 = require('./modules/cap2');
var Video = require('./modules/video')

app.post('/cap1', function(req,res){
    var namebd = req.body.name;
    var MenuCap1 = new Cap1({
        name: namebd,
        mang: []
    });

    MenuCap1.save(function(err){
        if(err){
            console.log('Error: '+err);
           res.json({error:1, msg:'Error: '+err});
        }else{
            console.log('Save Cap 1');
            
            res.json({error:0, msg:namebd + ' Created'});
        }
    });
});


app.post('/cap2',function(req,res){
    
    var namebd = req.body.name;
    var idgetcat = req.body.idcat;
    var MenuCap2 = new Cap2({
        name : namebd,
        idcat : idgetcat,
        mang : []
    });

    MenuCap2.save(function(err){
        if(err){
            console.log('Error'+err);
            res.json({kq:1, msg:"Error "+err});
        }else{
            console.log(namebd+' Created Cap 2');
            res.json({kq:0, msg:namebd+ " Created Cap 2"});

            //find id level 1 in cap1 update array in cap 1
            Cap1.findByIdAndUpdate(
                { _id : idgetcat },
                { $push : {mang: MenuCap2._id } },
                function(err){
                    if(err){
                        console.log('Err' + err);
                    }else{
                        console.log('Uppdated'); 
                    }
                }
            );
        }
    })
});


app.post('/xulyvideo',function(req,res){
  console.log(req.body);
  upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          res.send("A Multer error occurred when uploading."); 
        } else if (err) {
          res.send("An unknown error occurred when uploading." + err);
        }else{
            var idcatlv2 = req.body.slCap2;
            var namevideo = req.body.txtNameVideo;
            var valueiframe = req.body.txtValueVideo+'?autoplay=1';
            var image = req.file.filename;
            var VideoMenuCap2 = new Video({
                name : namevideo,
                value : valueiframe,
                idcat : idcatlv2,
                image : image
            });

            VideoMenuCap2.save(function(err){
            if(err){
                console.log('Error'+err);
                res.json({kq:1, msg:"Error "+err});
            }else{
                //find id level 1 in cap1 update array in cap 1
                Cap2.findByIdAndUpdate(
                    { _id : idcatlv2 },
                    { $push : {mang: VideoMenuCap2._id }},
                    function(err){
                        if(err){
                            console.log('Err' + err);
                        }else{
                            console.log('Uppdated'); 
                        }
                    }
                );
            }
        });
         res.redirect('/addlist');
        }
    });

});

app.post('/list/cap1',function(req,res){
    Cap1.aggregate([
        //list id
        //server name string lower
      {
        $lookup: {
            //name collection on database name not uppercase
            //get from collection
            from: "cap2",
            //get field from cap1
            localField: "mang",
            //get info from cap2
            foreignField: "_id",
            as : "danhsach"
        }
      }
    ],function(err,arr){
        if(err){
            console.log('Error '+err);
            res.json({kq:1,msg:"Error "+err});
        }else{
           res.json({kq:0,msg:"List Get", result: arr});
            //res.render('list',{arr});
            
        }
    })
});

app.post('/find/cap2',function(req,res){
    console.log(req.body.id);
    Cap2.find({idcat : req.body.id},function(err,ds){
        if(err){
            console.log("Get error" + err);
            res.json({kq:1, msg:"Get error" + err});
        }else{
            console.log("Get success");
           res.json({kq:0, result: ds})
        }
    });
});


app.post('/find/videos',function(req,res){
    Video.find({idcat : req.body.id },function(err,ds){
        console.log(ds);
        if(err){
            console.log("Get error" + err);
            res.json({kq:1, msg:"Get error" + err});
        }else{
            console.log("Get success");
           res.json({kq:0, result: ds})
        }
    });
});

app.post('/list/cap2',function(req,res){
    Cap2.aggregate([
        //list id
        //server name string lower
      {
        $lookup: {
            //name collection on database name not uppercase
            //get from collection
            from: "videos",
            //get field from cap2
            localField: "mang",
            //get info from video
            foreignField: "_id",
            as : "danhsach"
        }
      }
    ],function(err,arr){
        if(err){
            console.log('Error '+err);
            res.json({kq:1,msg:"Error "+err});
        }else{
           res.json({kq:0,msg:"List Get", result: arr});
            //res.render('list',{arr});
            
        }
    })
});



app.post('/getlist',function(req,res){
    Cap1.aggregate([
        //list id
        //server name string lower
      {
        $lookup: {
            //name collection on database name not uppercase
            //get from collection
            from: "cap2",
            //get field from cap1
            localField: "mang",
            //get info from cap2
            foreignField: "_id",
            as : "danhsach"
        }
      }
    ],function(err,arr){
        if(err){
            console.log('Error '+err);
            res.json({kq:1,msg:"Error "+err});
        }else{
           res.json({kq:0,msg:"List Get", result: arr});
            //res.render('list',{arr});
        }
   
    });
});


app.get('/admin',function(req,res){
    res.render('admin');
});

app.get('/',function(req,res){
    res.render('trangchu');
});

