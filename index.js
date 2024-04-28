require('dotenv').config()
const express=require('express');
const morgan = require('morgan');
const cors= require('cors');
const Person=require('./models/contact');




const app=express();



morgan.token('body', function (req) { return JSON.stringify(req.body) })


app.use(express.static('dist'))
app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


// let persons=
// [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]




app.get('/',(request,response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/persons',(request,response, next)=>{

  //response.json(persons)
  Person.find({}).then(contacts=>{
    response.json(contacts)
  }).catch(error => next(error))


})

//update
app.get('/info',(request,response, next)=>{

  Person.countDocuments().then(result=>{
    console.log(result);
    const timestamp=new Date().toUTCString();
    const extra=new Date().getTimezoneOffset();
    let string=`<p>Phonebook has info for ${result} <br/> ${timestamp}+${extra} (Pacific Standard Time)<p>`;
    response.send(string)
  })
  .catch(error => next(error))
  

})

//update send response back
app.get('/api/persons/:id',(request,response, next)=>{

  
  Person.findById(request.params.id)
    .then(result => {
      response.json(result)
    }).catch(error =>{
      next(error)
    })
  
})

app.put('/api/persons/:id',(request,response, next)=>{

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

  Person.findByIdAndUpdate(request.params.id,person,{new: true, runValidators: true, context: 'query'} )
  .then(() => {
    response.status(204).end();
  }).catch(error =>{
    next(error)
  })

})

app.delete('/api/persons/:id',(request,response, next)=>{

  Person.findByIdAndDelete(request.params.id)
  .then(() => {
    response.status(204).end();
  }).catch(error =>{
    //genereate dedicated middle ware
    next(error)
  })

})


function verify(body){
  if(body.name===undefined){
    return false;
  }
  if(body.number===undefined){
    return false;
  }

  return true;
}


app.post('/api/persons', (request, response, next) => {

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
  }).catch(error => {

    console.log(error)
    next(error)
  })

  

})


//if endpoint does not exist last 
const unkownEndpoint=(request,response) => {

  response.status(404).send({error: 'unkown endpoint'})

}

app.use(unkownEndpoint)

const ErrorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({error: 'malformatted id'})
  }else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

//next not working
app.use(ErrorHandler)


//create middle ware for error
const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})