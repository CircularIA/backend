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
        required: [true, 'Company is required'],
    },
    //Type of user
    //0: Admin
    //1: Owner of company
    //2: Regular user
    role:{
        type: Number,
        required: [true, 'User type is required'],
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
    const token = jwt.sign({_id: this._id}, process.env.JWT_KEY, {expiresIn: process.env.JWT_EXPIRES_IN});
    return { token, userId: this._id, userRole: this.role, userActive: this.active};
}

userSchema.methods.refreshToken = function(){
    const token = jwt.sign({_id: this._id}, process.env.JWT_KEY, {expiresIn: process.env.JWT_EXPIRES_IN});
    return { token, userId: this._id, userRole: this.role, userActive: this.active};
}

userSchema.methods.generatePasswordReset = function(){
    const token = jwt.sign({_id: this._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN});
    return token;
}

//Static method to validate the user data
userSchema.statics.validate = function(data){
    const Schema = Joi.object({
        username: Joi.string().required().label('Username').messages({'string.empty': 'Username is required'}),
        email: Joi.string().required().email().label('Email').messages({'string.empty': 'Email is required'}),
        password: Joi.string().required().label('Password').messages({'string.empty': 'Password is required'}),
        company: Joi.string().required().label('Company').messages({'string.empty': 'Company is required'}),
        role: Joi.number().required().min(1).max(2).integer().label('User type').messages({'string.empty': 'User type is required'}),
    });
    return Schema.validate(data);
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