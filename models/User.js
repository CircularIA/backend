import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

//Others models
import Company from './Company.js';

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    fullName:{
        type: String,
        required: [true, 'Full name is required'],
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already registered'],
        validate: {
            validator: function(v){
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: 'Invalid email',
        }
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        vaidate: passwordComplexity(),
    },
    //Define forget password atribute
    forgetPassword: {
        type: String,
        default: '',
    },
    //Company information
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required'],
        //Validate if the company exist
        validate: {
            validator: async function(v){
                const company = await Company.findById(v);
                return company;
            },
            message: 'Invalid company',
        },
    },
    //Type of user
    //0: Admin
    //1: Owner of company
    //2: Regular user
    type:{
        type: Number,
        required: [true, 'User type is required'],
        validate: {
            validator: function(v){
                return v == 0 || v == 1 || v == 2;
            },
            message: 'Invalid user type',
        },
    },
    //Flag to know if the user is active or not
    active:{
        type: Boolean,
        default: true,
    },
    //Asigned source type to the user
    //Just asigned if the user is a regular user
    sourceType:[
        {
            branch: {
                type: Schema.Types.ObjectId,
                ref: 'Branch',
            },
            sourceType: {
                type: String, 
                required: true,
            },
            active: {
                type: Boolean,
                default: true,
            }
        }
    ]
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id}, process.env.JWT_KEY, {expiresIn: '12h'});
    return { token, userId: this._id, userType: this.type, userActive: this.active};
}

userSchema.methods.refreshToken = function(){
    const token = jwt.sign({_id: this._id}, process.env.JWT_KEY, {expiresIn: '12h'});
    return { token, userId: this._id, userType: this.type, userActive: this.active};
}

const User = model('User', userSchema);

export default User;