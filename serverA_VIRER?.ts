require('dotenv').config()

const express = require('express')
const { Router } = require('express')
const app = express()
const bcrypt = require('bcrypt')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const jwt = require('jsonwebtoken')

import { Response, NextFunction } from 'express'

type Request = {
    headers: Headers;
    user: {
        name: string;
        username: string;
        password: string;
    };
    body: {
        name: string;
        username: string;
        password: string;
    };
}

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'API',
            description: '',
            contact: {
                name: 'Best front-end dev EUW'
            },
            // servers: [{ url: '/api' }]
            servers: [{
                url:`http://localhost:3000`,
                description: 'localhost'
            },],
        },
    },
    apis: [`./routes/*.js`]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

const router = Router()

app.use(express.json())

const posts = [
    {
        username: 'Luc',
        title: 'test1'
    },
    {
        username: 'Gaetan',
        title: 'J"adore le CSS'
    },
    {
        username: 'Luc2',
        title: 'test2'
    }
]

const users = []

app.get('/posts', authenticateToken, (req : Request,res : Response) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

app.get('/users', (req : Request, res : Response) => {
    res.json(users)
})

app.post('/users', async (req : Request, res : Response) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        console.log(hashedPassword)
        const user = {name:req.body.name, password: hashedPassword}
        users.push(user)
        res.status(201).send('User created')
    } catch {
        res.status(500).send()
    }
})

app.post('/users/login', async (req : Request,res : Response) => {
    const user = users.find(user => user.name == req.body.name)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success')
        } else {
            res.send('Wrong password')
        }
    } catch {
        res.status(500).send()
    }
})

function authenticateToken(req : Request, res : Response, next : NextFunction) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).send('No token given')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send('Not logged in')
        req.user = user
        next()
    })
}

app.listen(3000, () => console.log(`Listening on port 3000...`))