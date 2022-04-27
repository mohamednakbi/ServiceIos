const { request } = require('express')
const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const usershema = new mongoose.Schema(
    {
        
        event_title: {
            type: String,
            required:true,
            unique:true
        },
        venue: {
            type: String,
            required: true
        },
        maxParticipant: {
            type: Number,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        email : {
            type : String,
            required : true
        }
        
    })
mongoose.model("Event", usershema)