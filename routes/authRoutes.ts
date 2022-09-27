const { Router } = require('express')
const authController = require('../controller/authController')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
import { Request, Response, NextFunction } from 'express'
import { User } from '../types/types'

const router = Router();

// A GERER
let refreshTokens = []

router.post('/token', (req : Request, res : Response) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err : Error, user : User) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.username})
        res.json({accessToken: accessToken})
    })
})

router.delete('/logout', (req : Request, res : Response) => {
    refreshTokens = refreshTokens.filter( token => token !== req.body.token)
    res.sendStatus(204)
})



router.post('/login', (req : Request, res : Response) => {

    const username = req.body.username
    const user = { name: username }

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

function generateAccessToken(user) {
    // return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'})
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}

router.post('/users/login', authController.login)


module.exports = router