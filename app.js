//import
var express = require('express');
var app = express();
var mongo = require('mongodb');
var dotenv = require('dotenv');
dotenv.config();
var MongoClient= mongo.MongoClient;
const mongoUrl= process.env.Mongoliveurl;
var cors = require('cors');
const bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
//db collection
var db;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
// first default route
app.get('/',(req,res) => {
    res.send("Hiii From Express")
})

app.get('/dblocation',(req,res) => {
    db.collection('dblocation').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})
app.get('/dbmealtype',(req,res) => {
    db.collection('dbmealtype').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

//restrodata================================================================restaurant
app.get('/restrodata',(req,res) => {
    db.collection('restrodata').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})
//restaurant wrt to id 
app.get('/restrodata/:id',(req,res) => {
    var id = parseInt(req.params.id);
    db.collection('restrodata').find({"restaurant_id":id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result) 
    })
})

//query param exam
app.get('/restrodata',(req,res) => {
    var query = {};
    if(req.query.city){
        query={state_id:Number(req.query.city)}
    }
    db.collection('restrodata').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//restaurant wrt to mealid 
app.get('/filter/:mealid',(req,res) => {
    var id = parseInt(req.params.mealid);
    var sort ={cost:1}
    var query = {"mealTypes.mealtype_id":id}
    if(req.query.sortkey){
        var sortkey = req.query.sortkey
        if(sortkey>1 || sortkey<-1 || sortkey==0){
          sortkey = 1
        }
        sort={cost:Number(sortkey)}
    }

    //low and high cost,cuisine 
    if(req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);
    }
//cuisine and cost
    if(req.query.cuisine && req.query.lcost && req.query.hcost){
        let lcost = Number(req.query.lcost);
        let hcost = Number(req.query.hcost);
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],
        "cuisines.cuisine_id":Number(req.query.cuisine),
        "mealTypes.mealtype_id":id}
    }
    //only cuisine
   else if (req.query.cuisine){
        query={"mealTypes.mealtype_id":id,"cuisines.cuisine_id":Number(req.query.cuisine)}
//only cost
    }else if(req.query.lcost && req.query.hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":id}
    }


    db.collection('restrodata').find(query).toArray((err,result) =>{
      
        if(err) throw err;
        res.send(result) 
    })
})

app.get('/menu/:restid',(req,res) => {
    var restid = Number(req.params.restid)
    db.collection('menu').find({restaurant_id:restid}).toArray((err,result) => {
      if(err) throw err;
        res.send(result)
    })
})
app.post('/menuItem',(req,res) => {
    console.log(req.body);
    db.collection('menu').find({menu_id:{$in:req.body}}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
    
})
app.put('/updateStatus/:id',(req,res) => {
    var id = Number(req.params.id);
    var status = req.body.status?req.body.status:"Pending"
    db.collection('orders').updateOne(
        {id:id},
        {
            $set:{
                "date":req.body.date,
                "bank_status":req.body.bank_status,
                "bank":req.body.bank,
                "status":status
            }
        }
    )
    res.send('data updated')
})
//all orders
app.get('/orders',(req,res) => {
    db.collection('orders').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})
app.post('/placeOrder',(req,res) => {
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send("order placed")
    })
})
app.delete('/deletOrders',(req,res)=>{
    db.collection('orders').remove({},(err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//connect to db
MongoClient.connect(mongoUrl, (err,client) => {
    if(err) console.log("Error While Connecting");
    db = client.db('edufirst');
    app.listen(port,()=>{
        console.log(`localhost:// ${port}`)
    })
})