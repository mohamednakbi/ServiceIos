const { request } = require('express')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const Event = mongoose.model("Event")


router.post('/addEvent', (req, res) => {
	const { event_title, venue, maxParticipant, date,time,email} = req.body

	const event = new Event({
		event_title: event_title,
		venue: venue,
		maxParticipant: maxParticipant,
		date: date,
		time:time,
		email : email
	})
    event.save().then(response => {res.json(event)})
})


router.get('/loadMyEvents', (req, res) => { 
    Event.find({ email : req.headers.email })
        .exec(function(err, data) {
    if(err) res.status(500).send(err);
    else res.send(data);
  })
        //console.log(req.headers)
});


router.post('/updateEvent', (req, res) => {
    let updateEvent = {
        id: req.body._id,
		event_title: req.body.event_title,
		venue: req.body.venue,
		maxParticipant: req.body.maxParticipant,
		date: req.body.date,
		time:req.body.time
    }
    console.log(updateEvent)
    Event.findByIdAndUpdate(req.body._id,{$set: updateEvent})
    .then(() => {
        res.json({message: "The Event updated successfully"})
    })

})


router.delete('/deleteEvent', function (req, res) {
  var id = req.body._id;
  Event.findOneAndRemove({ _id: id }, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send();
    }
    return res.status(200).send();

  });
});






module.exports = router