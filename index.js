require('dotenv').config()
const http=require('http')
const express=require('express');
const { time } = require('console');
const morgan = require('morgan');
const cors= require('cors');
const Contact=require('./models/contact');
const contact = require('./models/contact');




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
  Contact.find({}).then(contacts=>{
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

  const id=Number(request.params.id)
  console.log(id)
  const person=persons.find((person) => {
    return id==person.id;
  })

  if(person){
    response.json(person)
    return;
  }

  response.status(404).send('resource not found')
  
})

app.delete('/api/persons/:id',(request,response)=>{

  const id=Number(request.params.id)
  persons=persons.filter(person => {

    return id!==person.id

  })
  response.status(204).end()
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
    return response.status(400).json({
      error: 'content missing'
    })
  }

  // let same_name=persons.find(person=>{
  //   return person.name===request.body.name;
  // })

  // if(same_name!==undefined){
  //   return response.status(400).json({
  //     error: 'person name is not unique' 
  //   })
  // }


 

  let person = new Contact({
    name: request.body.name,
    number: request.body.number,
  })
  
  person.save().then(result=>{
    console.log(result)
    response.status(201).json(result)
  })

  

})

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})