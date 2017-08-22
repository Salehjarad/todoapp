const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash')
const scu = 'hellosalehjaradhowareyou';

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} not valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id','email']);
};

UserSchema.methods.generateAuthToekn = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'saleh').toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};


UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try {
       decoded = jwt.verify(token, 'skom');
    } catch(e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

var User = mongoose.model('user', UserSchema);
module.exports = {User}