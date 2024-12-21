const express = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => response.json(persons))
    .catch(error => response.status(500).json({ error: 'failed to fetch persons' }))
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => response.status(400).json({ error: 'invalid id' }))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => response.status(400).json({ error: 'invalid id' }))
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'content missing' })
  }

  Person.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: 'name must be unique' })
      }

      const person = new Person({ name, number })
      return person.save()
    })
    .then(savedPerson => response.json(savedPerson))
    .catch(error => response.status(500).json({ error: 'failed to save person' }))
})

app.put('/api/persons/:id', (request, response) => {
  const { name, number } = request.body
  const { id } = request.params

  if (!name || !number) {
    return response.status(400).json({ error: 'content missing' })
  }

  Person.findById(id)
    .then(person => {
      person.name = name
      person.number = number
      return person.save()
    })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => {
      response.status(500).json({ error: 'failed to update person' })
    })
})

app.get('/api/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`Phonebook has info for ${count} people <br/> ${new Date()}`)
    })
    .catch(error => response.status(500).json({ error: 'failed to fetch count' }))
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})