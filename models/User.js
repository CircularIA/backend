import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username:{
        type: String,
        required: [true, 'Full name is required'],
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already registered'],
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
    },
    //Define forget password atribute
    resetPasswordToken: {
        type: String,
        default: '',
    },
    resetPasswordExpires: {
        type: Date,
        default: '',
    },
    //Company information
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },
    //Type of user
    //Admin
    //Owner of company
    //Regular user
    role:{
        type: String,
        enum: ['Admin', 'Owner', 'Regular'],
        default: 'Regular',
        required: [true, 'User type is required'],
    },
    //Flag to know if the user is active or not
    active:{
        type: Boolean,
        default: true,
    },
    //Indicators assigned to the user
    //Indicators are assigned by the company owner
    //Have to match with the indicators of the branch and the company
    indicators: [{
        type: Schema.Types.ObjectId,
        ref: 'Indicator',
        sourceType: [{
            type: String
        }],
        active: { type: Boolean, default: true },
        activeRegisters: [{
            date: { type: Date, default: new Date() }, //Fecha de activacion (año, mes, dia)
            value: { type: Boolean, default: true }, //Valor de activacion
            user: { //Usuario que brindo el acceso al usuario
                name: { type: String },
                email: { type: String },
            }
        }],
    }],
    //Branches assigned to the user
    //Branches are assigned by the company owner
    //Have to match with the branches of the company
    branches: [{
        type: Schema.Types.ObjectId,
        ref: 'Branch',
    }],
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id, role: this.role}, process.env.JWT_KEY, {expiresIn: process.env.JWT_EXPIRES_IN});
    return { token, userId: this._id, userRole: this.role};
}

userSchema.methods.refreshToken = function(){
    const token = jwt.sign({_id: this._id, role:this.role}, process.env.JWT_KEY, {expiresIn: process.env.JWT_EXPIRES_IN});
    return { token, userId: this._id, userRole: this.role};
}

userSchema.methods.generatePasswordReset = function(){
    const token = jwt.sign({_id: this._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN});
    return token;
}

//Static method to validate the user data
//Admin
userSchema.statics.validateAdmin = async function(data){
    const Schema = Joi.object({
        username: Joi.string().required().label('Username').messages({'string.empty': 'Username is required'}),
        email: Joi.string().required().email().label('Email').messages({'string.empty': 'Email is required'}),
        password: Joi.string().required().label('Password').messages({'string.empty': 'Password is required'}),
    })
}

userSchema.statics.validateOwner = async function(data){
    const Schema = Joi.object({
        username: Joi.string().required().label('Username').messages({'string.empty': 'Username is required'}),
        email: Joi.string().required().email().label('Email').messages({'string.empty': 'Email is required'}),
        password: Joi.string().required().label('Password').messages({'string.empty': 'Password is required'}),
        company: Joi.string().required().label('Company').messages({'string.empty': 'Company is required'}),
    });
    return Schema.validateAsync(data);
}

userSchema.statics.validateRegularUser = async function(data){
    const Schema = Joi.object({
        username: Joi.string().required().label('Username').messages({'string.empty': 'Username is required'}),
        email: Joi.string().required().email().label('Email').messages({'string.empty': 'Email is required'}),
        password: Joi.string().required().label('Password').messages({'string.empty': 'Password is required'}),
        company: Joi.string().required().label('Company').messages({'string.empty': 'Company is required'}),
        indicators: Joi.array().label('Indicators').messages({'string.empty': 'Indicators is required'}),
        branches: Joi.array().label('Branches').messages({'string.empty': 'Branches is required'}),
    });
}
//Static method to validate the password reset
userSchema.statics.validatePasswordReset = function(data){
    const Schema = Joi.object({
        token: Joi.string().required().label('Token').messages({'string.empty': 'Token is required'}),
        password: passwordComplexity().required().label('Password').messages({'string.empty': 'Password is required'}),
        confirmPassword: Joi.ref('password'),
    });
    return Schema.validate(data);
}

const User = model('User', userSchema);

export default User;