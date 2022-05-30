const mongoose = require('mongoose')

const UserSchema = mongoose.Schema;

const User = new UserSchema({
    full_name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    address: {
        type: String,
        required:true
    },
    publicKey: {
        type: String,
    },
    privateKey: {
        type: String,
    },
    Wif: {
        type: String,
    },
    balance: {
        type: Number,
    }
});

const TransanctionSchema = new UserSchema({
    amount_to_receiver: {
        type:Number
    },
    amount_remaining: {
        type:Number
    },
    type: {
        type: String
    },
    sender: {
        type: String
    },

    date: {
        type: String
    },
    receiver: {
        type: String,
    },
    status: {
      type: String,  
    },
    price: {
        type: String, 
    },
    main: {
        type: Number,
    }
})

const UserModel = mongoose.model('users', User);
const Transaction = mongoose.model('transaction', TransanctionSchema)
module.exports = { UserModel, Transaction };