require('dotenv').config()
const http=require('http')
const express=require('express');
const { time, error } = require('console');
const morgan = require('morgan');
const cors= require('cors');
const Person=require('./models/contact');




const app=express();



morgan.token('body', function (req, res) { return JSON.stringify(req.body) })



app.use(express.static('dist'))
app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


let persons=
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]




app.get('/',(request,response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/persons',(request,response)=>{

  //response.json(persons)
  Person.find({}).then(contacts=>{
    response.json(contacts)
  })


})


app.get('/info',(request,response)=>{
  const entries=persons.length;
  const timestamp=new Date().toUTCString();
  const extra=new Date().getTimezoneOffset();
  let string=`<p>Phonebook has info for ${entries} <br/> ${timestamp}+${extra} (Pacific Standard Time)<p>`;
  response.send(string)

})

app.get('/api/persons/:id',(request,response)=>{

  
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    }).catch(error =>{
      next(error)
    })
  
})

app.put('/api/persons/:id',(request,response)=>{

  if (!verify(request.body)) {
    let error={
       error: 'content missing'
    }
    next(error)
    return;
  }

  let person = {
    name: request.body.name,
    number: request.body.number,
  }

  Person.findByIdAndUpdate(request.params.id,person,{new: true})
  .then(result => {
    response.status(204).end();
  }).catch(error =>{
    next(error)
  })

})

app.delete('/api/persons/:id',(request,response)=>{

  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end();
  }).catch(error =>{
    //genereate dedicated middle ware
    next(error)
  })

})

function getRandomInt(){
  return Math.floor(Math.random()*Number.MIN_SAFE_INTEGER)
}


function verify(body){
  if(body.name===undefined){
    return false;
  }
  if(body.number===undefined){
    return false;
  }

  return true;
}


app.post('/api/persons', (request, response) => {

  // console.log(request.body)
  if (!verify(request.body)) {
    let error={
       error: 'content missing'
    }
    next(error)
    return;
  }

   let person = new Person({
    name: request.body.name,
    number: request.body.number,
  })
  
  person.save().then(result=>{
    console.log(result)
    response.status(201).json(result)
  }).catch(error => next(error))

  

})


//if endpoint does not exist last 
const unkownEndpoint=(request,response) => {

  response.status(404).send({error: 'unkown endpoint'})

}

app.use(unkownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({error: 'malformatted id'})
  }
  next(error)
}

app.use(errorHandler)


//create middle ware for error
const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})