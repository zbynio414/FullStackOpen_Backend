require('dotenv').config()
const express = require('express')
const app = express()
const Contact = require('./models/contact')

const morgan = require('morgan')
const cors = require('cors')
const { response } = require('express')

const requestTime = (req, res, next) => {
  req.requestTime = Date.now()
  next()
}

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformated id'})
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

app.use(requestTime)
app.use(express.json())
//app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))

let persons = [
]

morgan.token('body', req => {
    return JSON.stringify(req.body)
  })

app.get('/api/persons', (req, res) => {
  Contact.find({}).then(contacts => {
    res.json(contacts)
  })
})

app.get('/api/persons/:id', (req, res) => {
  Contact.findById(req.params.id).then(contact => {
    if (contact) {
      res.json(contact)
    } else {
      res.status(404).end()
    }
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Contact.findByIdAndRemove(req.params.id)
  .then(result =>{
  res.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name) {return res.status(400).json(`error: name missing`)};
  if (!body.number) {return res.status(400).json(`error: number missing`)};
/*if (persons.find(person => person.name === body.name)) 
    {return res.status(400).json(`error: name must be unique`)};
*/
  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  contact.save()
  .then(savedContact => {
    res.json(savedContact)
  })
  .catch(error => next(error))  
})

app.get('/info', (req, res) => {
  Contact.countDocuments({}, (err, count) => {A
    let info = `Phonebook has info for ${count} people.`
    info += `<br/>`
    info += `<br>${Date(req.requestTime).toString()}</br>` 
    res.send(info)
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Contact.findByIdAndUpdate(
    req.params.id, 
    {name, number},
    {new: true, runValidators: true, context: 'query'}
    )
    .then(updatedContact => {
      res.json(updatedContact)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
