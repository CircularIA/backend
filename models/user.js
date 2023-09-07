const moongose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const userSchema = new moongose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    companyName:{
        type: String,
        required: true,
    },
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id}, process.env.JWT_KEY, {expiresIn: '2h'});
    return { token, userId: this._id };
}

const User = moongose.model('User', userSchema);

const validate = (data) => {
    const Schema = Joi.object({
        fullName: Joi.string().required().label('Full Name'),
        email: Joi.string().required().email().label('Email'),
        password: passwordComplexity().required().label('Password'),
        companyName: Joi.string().required().label('Company Name'),
    });
    return Schema.validate(data);
}

module.exports = { User, validate };
