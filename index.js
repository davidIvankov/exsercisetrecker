const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
let myAccount = process.env.MONGO_URI 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors())

app.use(express.static('public'))

app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/views/index.html')
});
mongoose.set('strictQuery', false);

mongoose.connect(myAccount,{ useNewUrlParser: true, useUnifiedTopology: true } )

UsersSchema = mongoose.Schema({
  username: String,
})
User = mongoose.model('User', UsersSchema);
UsersSchema.plugin(AutoIncrement, {inc_field: 'id'})
ExsercisesSchema = mongoose.Schema({
  id: String,
  description: String,
  duration: Number,
  date: Date
})
Exsercise = new mongoose.model('Exsercise', ExsercisesSchema);


app.get('/api/users', function(req, res){
  User.find({}, function(err, data){
if (err) console.error(err)
else res.send([...data])
  })
})

app.get('/api/users/:_id/logs', function(req, res){
  let regex = /\s/g
  let from = req.query.from;
  let to= req.query.to;
  let limit= req.query.limit;
  let id = req.params._id;
  User.findOne({_id: id}, function(err, data){
    if(err) console.error(err)
    else {
      let name = data.username;
      if (from === undefined && to === undefined && limit === undefined){
      Exsercise.count({id:id}, function(err, data){
        if(err) console.error(err)
        else {
          let count= data
          
          Exsercise.find({id:id},{description:1, duration: 1, date:1}, function(err, data){
            if(err) console.error(err)
            else{

            let thing =[...data.map(d=>{
              
                return {description:d.description, duration:d.duration, date: d.date.toDateString()}
              })]
              res.json({
                username: name,
                count: count,
                _id: id,
                log: thing
                })

              }
            })
          }
        })
      } else {

        if (from === undefined && to !== undefined){
          
          let toins = to.replace(regex, '-');
      let toinsert = new Date(toins);
      let toutput = toinsert.toDateString()

      let forQueryTo = Date.parse(`${toutput} 00:00:00 GMT`);

      Exsercise.find({id:id, date: {$lt: forQueryTo}},{description:1, duration: 1, date:1}, function(err, data){
            if(err) console.error(err)
            else{
              let thing =[...data.map(d=>{
              
                return {description:d.description, duration:d.duration, date: d.date.toDateString()}
              })]
              if (limit !== undefined){
             let insert = []
                for (let i = 0; i<limit; i++){
                  insert.push(thing[i])
                };
              res.json({
                username: name,
                count: limit,
                _id: id,
                log: insert
                })
              } else {
                let count = thing.length;
                res.json({
                username: name,
                count: count,
                _id: id,
                log: thing
                })
              }

              }
            })
        } else if(to === undefined && from !== undefined){
        let ins = from.replace(regex, '-');
      let nsert = new Date(ins);
      let output = nsert.toDateString();

      let forQueryFrom = Date.parse(`${output} 00:00:00 GMT`);

      Exsercise.find({id:id, date: {$gt: forQueryFrom}},{description:1, duration: 1, date:1}, function(err, data){
            if(err) console.error(err)
            else{
              let thing =[...data.map(d=>{
              
                return {description:d.description, duration:d.duration, date: d.date.toDateString()}
              })]
              if (limit !== undefined){
            let insert = []
                for (let i = 0; i<limit; i++){
                  insert.push(thing[i])
                };
              res.json({
                username: name,
                count: limit,
                _id: id,
                log: insert
                })
              } else {
                let count = thing.length;
                res.json({
                username: name,
                count: count,
                _id: id,
                log: thing
                })
              }

              }
            })

        } else if (to !== undefined && from !== undefined){
        let ins = from.replace(regex, '-');
      let nsert = new Date(ins);
      let output = nsert.toDateString()
        let toins = to.replace(regex, '-');
      let toinsert = new Date(toins);
      let toutput = toinsert.toDateString()

      let forQueryTo = Date.parse(`${toutput} 00:00:00 GMT`);
      let forQueryFrom = Date.parse(`${output} 00:00:00 GMT`);

      Exsercise.find({id:id, date: {$gt: forQueryFrom, $lt: forQueryTo}},{description:1, duration: 1, date:1}, function(err, data){
            if(err) console.error(err)
            else{
              let thing =[...data.map(d=>{
              
                return {description:d.description, duration:d.duration, date: d.date.toDateString()}
              })]
              if (limit !== undefined){
             let insert = []
                for (let i = 0; i<limit; i++){
                  insert.push(thing[i])
                };
              res.json({
                username: name,
                count: limit,
                _id: id,
                log: insert
                })
              } else {
                let count = thing.length;
                res.json({
                username: name,
                count: count,
                _id: id,
                log: thing
                })
              }

              }
            })
          }  else {
            Exsercise.find({id:id},{description:1, duration: 1, date:1}, function(err, data){
            if(err) console.error(err)
            else{
              let thing =[...data.map(d=>{
              
                return {description:d.description, duration:d.duration, date: d.date.toDateString()}
              })]
             let insert = []
                for (let i = 0; i<limit; i++){
                  insert.push(thing[i])
                };
              res.json({
                username: name,
                count: limit,
                _id: id,
                log: insert
                })

              }
            })

          }
        }
    
    }
  })
});


app.post('/api/users', function(req, res){
  let user = req.body.username;
  User.exists({username:user},(err, data)=>{
    if(err) console.error(err)
    if (data === null) {
     let Usernew = new User({
      username: user
     }) 
     Usernew.save();
     setTimeout(function(){
      User.findOne({username: user}, "_id", function(err, data){
        if(err) console.error(err)
       else  res.json({
          username: user,
          _id: data._id
        })
      })
     }, 1000)
    } else {
      User.findOne({username: user},'_id', function(err, data){
        if(err) console.error(err)
       else res.json({
          username: user,
          _id: data._id
        })
      })
    }
  })
})

app.post("/api/users/:_id/exercises", function(req, res){
  let id = req.params._id
  let description = req.body.description;
  let duration = Number(req.body.duration);
  let date = req.body.date;
 
  if (!date){
    let now = new Date()
    let usable = now.toDateString()
    console.log(usable)
   let AddedExx = new Exsercise({
    id: id,
    description: description,
    duration: duration,
    date: usable,
   })
 
   
   AddedExx.save();
   User.findOne({_id: id}, function(err, data){
    if (err) console.error(err)
    else {
     let name = data.username;
     
     res.json({
      _id: id,
      username: name,
      date: usable,
      duration:duration,
      description: description
     })
    }
   })
  } else {
      let regex = /\s/g
      let ins = date.replace(regex, '-');
      let insert = new Date(ins);
      let output = insert.toDateString()
      let forDb = Date.parse(`${output} 00:00:00 GMT`)
  let AddedEx = new Exsercise({
    id: id,
    description: description,
    duration: duration,
    date: forDb
  })
  AddedEx.save();
  User.findOne({_id: id}, function(err, data){
    if (err) console.error(err)
    else {
     let name = data.username;
     
     res.json({
      _id: id,
      username: name,
      date: output,
      duration:duration,
      description: description
     })
    }
   })
}

})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
