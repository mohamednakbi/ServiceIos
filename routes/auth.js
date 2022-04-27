const { request } = require('express')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const requireLogin = require('../middleware/requireLogin')

const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')



router.get('/protected', requireLogin, (req, res) => {
    res.send("hello user ")
})

router.get('/', (req, res) => {
    res.send("hello")
})
router.post('/signup', (req, res) => {
    const {  name, email, password, age , phone} = req.body
    if ( !email || !name || !password || !age || !phone) {
        res.json({ error:"please add all the feilds" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error:"user already exist change the email" })
            }
            bcrypt.hash(password, 12)
                .then(hasedPassword => {
                    const user = new User({
                        name,
                        email,
                        password: hasedPassword,
                        age,
                        phone
                    })
                    user.save()
                        .then(user => {
                            res.json({ message: "successfuly Login" })
                        })
                        .catch(err => {
                            console.log(err)
                        })

                })
           
        })
    
})
router.post('/signin', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(422).json({error:"please provide email or password"})
    }
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "user did not exist" })
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                       const accessToken = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                       res.status(200).send(JSON.stringify({ //200 OK
                        id:savedUser._id,
                        name:savedUser.name,
                        email:savedUser.email,
                        age:savedUser.age,
                        phone:savedUser.phone,
                        token:accessToken
                        }))
                    }
                    else {
                        return res.status(422).json({ error: "invalid email or password" })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })
})


router.post('/UpdateUser', (req, res) => {
    let updatedUser = {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        age: req.body.age,
    }
    User.findByIdAndUpdate(req.body.id,{$set: updatedUser})
    .then(() => {
        res.json({message: "user updated successfully"})
    })
    .catch(error => {
        res.json({
            message: "an error occured when updating user"
        })
    })
})

router.post('/UpdatePassword', (req, res) => {
    bcrypt.hash(req.body.password,10,function(err,hashedPass) {
        console.log(req.body);
        if (err) {
            console.log('erreur password hash');
            res.json({
                error: err
            })
        }

    let updatedUser = {
        id: req.body.id,
        password: hashedPass
    }

    User.findByIdAndUpdate(req.body.id,{$set: updatedUser})
    .then(() => {
        res.json({message: "Password user updated successfully"})
    })
    .catch(error => {
        res.json({
            message: "an error occured when updating Password user"
        })
    })
})
})
module.exports = router