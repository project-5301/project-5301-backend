const mongoose = require('mongoose');
const{Schema} = mongoose;

const notificationSchema = new Schema({
    type:{
        type: String,
        enum : ['email','SMS', 'push', 'in-app'],
        required: true,
    },
    title: {
        type:String,
        required: true,
    },
    message:{
        type :String,
        required: true,
    },
    status:{
        type:String,
        enum: ['pending', 'in-progress','completed'],
        default:'pending'
    },
    createdAt:{
        type:Date,
        default: Date.now,
    },
    sentAt:{
        type:Date,
    }
});

const Notification = mongoose.model('Notification',notificationSchema);

module.exports = Notification;
