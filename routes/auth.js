const { request } = require('express')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const requireLogin = require('../middleware/requireLogin')

const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
var nodemailer = require("nodemailer");


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
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "onebloodesprit@gmail.com",
    pass: "icwzpfvzcnykyfsd",
  },
  tls: {
    rejectUnauthorized: false
}
});


router.post("/forgetPassword", async (req, res) => {
    const userMail = await User.findOne({ email: req.body.email });
    if (!userMail) {
      res.status(202).json({
        message: "email not found",
      });
    } else {
     /*
        var code = (Math.floor(Math.random() * 10000) + 10000)
        .toString()
        .substring(1);
      console.log(code);
     */
      var code = Math.floor(Math.random() * 100000);
      var mailContent = `Almost done : ` + code;
  
      var mailOptions = {
        from: "onebloodesprit@gmail.com",
        to: req.body.email,
        subject: "Forgot Password ",
        text: mailContent,
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.json({ message: "error sending" });
          console.log(error);
        } else {
          res.status(200).json({
            code: code,
          });
          User.findOneAndUpdate(
            { email: req.body.email },
            { code: code },
            { new: true }
          )
  
            .then((user) => {
              //console.log(user);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    }
  });
  
  router.post("/VerifCode", async (req, res) => {
    // Go from Otp to Page change password
    const user = await User.findOne({ email: req.body.email });
    if (user.code == req.body.code) {
      res.json({ message: "code correct" });
    } else {
      res.json({ message: "code incorrect" });
    }
  });
  
  router.post("/changePassword", async (req, res) => {
    // Change Password
    const user = await User.findOne({ email: req.body.email });
    if (user.code == req.body.code) {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        } else {
          user.password = hash;
          user.code = "";
          user.save().then((user) => {
            res.json({ message: "password changed" });
          });
        }
      });
    } else {
      res.json({ message: "code incorrect" });
    }
  });
  
  router.post("/ByFacebook", async (req, res) => {
    const { name, email } = req.body;
  
    const user = await User.findOne({ email: email });
    if (user) {
      console.log("if email exist ---->  Login by Facebook");
  
      ///////////////////////////////////////////////////////////////////////////////
      User.findOne({ email: email }).then((savedUser) => {
        if (savedUser) {
          const accessToken = jwt.sign(
            { _id: savedUser._id },
            process.env.JWT_SECRET
          );
          res.status(200).send(
            JSON.stringify({
              //200 OK
              id: savedUser._id,
              name: savedUser.name,
              email: savedUser.email,
              blood: savedUser.blood,
              age: savedUser.age,
              weight: savedUser.weight,
              adress: savedUser.adress,
              phone: savedUser.phone,
              usertype: savedUser.usertype,
              avatar: savedUser.avatar,
              token: accessToken,
            })
          );
        }
      });
    }
    ////////////////////////////////////////////////////////////////////////////////
    else {
      console.log("if email exist ---->  Inscription by Facebook");
  
      const savedUser = new User({
        name,
        email,
        password: " ",
        blood: "IDK",
        age: " ",
        weight: " ",
        adress: " ",
        phone: " ",
        usertype: "Donor",
        avatar: name,
        code: " ",
      });
      savedUser
        .save()
        .then((savedUser) => {
          res.status(202).send(
            JSON.stringify({
              //200 OK
              id: savedUser._id,
              name: savedUser.name,
              email: savedUser.email,
              blood: savedUser.blood,
              age: savedUser.age,
              weight: savedUser.weight,
              adress: savedUser.adress,
              phone: savedUser.phone,
              usertype: savedUser.usertype,
              avatar: savedUser.avatar,
              token: "",
            })
          );
        })
        .catch((err) => {
          console.log(err);
          console.log(err.stack);
        });
    }
  });
module.exports = router
