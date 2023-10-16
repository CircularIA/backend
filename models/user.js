const moongose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const userSchema = new moongose.Schema({
    _id: moongose.Schema.Types.ObjectId,
    fullName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    //Company information
    company: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    //Type of user
    //0: Admin
    //1: Owner of company
    //2: Regular user
    type: {type: Number, default: 0},
    flag: {type: Boolean, default: false}, 
    //Departament of the user, just for regular users
    departament: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'Departament',
    },
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id}, process.env.JWT_KEY, {expiresIn: '2h'});
    return { token, userId: this._id, userFlag: this.flag};
}

const User = moongose.model('User', userSchema);

const validate = (data) => {
    const Schema = Joi.object({
        fullName: Joi.string().required().label('Full Name'),
        email: Joi.string().required().email().label('Email'),
        password: passwordComplexity().required().label('Password'),
        type: Joi.boolean().label('Type'),
    });
    return Schema.validate(data);
}

module.exports = { User, validate };
