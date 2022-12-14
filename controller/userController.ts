import { ErrorRequestHandler, Request, Response, NextFunction } from 'express'
const queries = require('../queries/queries')
const pool = require('../database/db-local')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const getUsers = (req : Request, res : Response) => {
    pool.query(queries.getUsers, (error : Error, result : any) => {
        if (error) throw error;
        res.status(200).json(result.rows)
    })
}

const getUserById = (req : Request, res : Response) => {
    const id = Number(req.params.id)
    pool.query(queries.getUserById, [id], (error:ErrorRequestHandler, result:any) => {
        try {
            // if(!Number.isInteger(id)) throw new BadRequestException("ID non trouvé")
            // const noTemplateFound = !result.rows.length
            // if(noTemplateFound) throw new NotFoundException("Impossible de lire un ID inexistant")
            if (error) throw error
            res.status(200).json(result.rows)
        } catch (error) {
            res.send(error)
        }
    })
}

const postUser = async (req : Request, res : Response) => {
    try {
        const { username, firstname, lastname, date_of_birth, email, profile_picture } = req.body
        let hashedPassword = await bcrypt.hash(req.body.password, 10);
        pool.query(queries.addUser, [username, hashedPassword, firstname, lastname, date_of_birth, email, profile_picture], (error : ErrorRequestHandler, result : any) => {
            if(error) throw error
            res.status(200).send("Created Succesfully!")
        })
    } catch {
        res.sendStatus(500)
    }
}


// DOUBLE PROMISE
// const login = async (req : Request, res : Response) => {

//     let users = []

//     const userPromise = new Promise((resolve, reject) => {

//         pool.query(queries.getUsers, (error : Error, result : any) => {
//             if (error) reject(error)
//             else {resolve(result)}
//         })
//     })

//     userPromise.then(async (response : any) => {
//         users = response.rows
    
//         const user = users.find(user => user.username == req.body.username)
//         if (user == null) {
//             return res.status(400).send('Cannot find user')
//         }
//         try {
//             if (await bcrypt.compare(req.body.password, user.password)) {
//                 res.send('Success')
//             } else {
//                 res.send('Wrong password')
//             }
//         } catch {
//             res.status(500).send()
//         }
//     })
// }



module.exports = {
    getUsers,
    getUserById,
    postUser,
}