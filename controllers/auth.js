//Packages
import Joi from 'joi';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
//Models
import  User  from '../models/User.js';

const validate = (data) => {
    const Schema = Joi.object({
        email: Joi.string().required().email().label('Email'),
        password: Joi.string().required().label('Password'),
    });
    return Schema.validate(data);
}

export const login = async (req, res) => {
    try {
        const {error} = validate(req.body);
        if(error)
            return res.status(400).send(error.details[0].message);
        const user = await User.findOne({email: req.body.email});
        if (!user)
            return res.status(401).send('Invalid email or password.');
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword)
            return res.status(401).send('Invalid email or password.');
        const token = user.generateAuthToken();

        // Configura la cookie segura con HttpOnly y Secure true al usar HTTPS
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send({ data: token, message: 'Login successful.' });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

//Forget Password
export const forgetPassword = async (req, res) => {
    const {email} = req.body;
    if (!email)
        return res.status(400).send('Email is required.');
    try {
        //Obtener si el usuario existe
        const CurrentUser = await User.findOne({email});
        if (!CurrentUser) throw new Error('Email does not exist.');
        //Generar token
        const token = CurrentUser.generatePasswordReset();
        
        //Configure the email stmtp
        const transporter = nodemailer.createTransport({
            host : process.env.CPANEL_APP_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.CPANEL_APP_EMAIL,
                pass: process.env.CPANEL_APP_PASSWORD,
            },
        });

        //!Cambiar la url por la url de producción en el futuro
        const data = {
            from: process.env.CPANEL_APP_EMAIL,
            to: CurrentUser.email,
            subject: 'Reset Account Password Link',
            html: `
            <h2>Please click on the given link to reset your account password</h2>
            <a href="${process.env.FRONTEND_URL}/reset-password/${token}" style="text-decoration:none;color:#fff;background-color:#0DFF6E;text-align:center;vertical-align:middle;display:inline-block;font-weight:500;font-size:large;line-height:1.125rem;border-top:12px solid #0DFF6E;border-bottom:12px solid #0DFF6E;border-right:30px solid #0DFF6E;border-left:30px solid #0DFF6E" target="_blank">
                <font color="#ffffff">Reset my password</font>
            </a>    
            `
        };
        return CurrentUser.updateOne({resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000})
            .then(() => {
                transporter.sendMail(data, (err) => {
                    if (err) {
                        console.log("error transporter", err)
                        return res.status(500).send({message: err.message});
                    }
                    return res.status(200).send({message: 'A reset email has been sent to ' + CurrentUser.email + '.'});
                });
            })
            .catch((err) => {
                return res.status(500).send({message: err.message});
            });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}

//Reset Password
export const resetPassword = async (req, res) => {
    try {
        //Validar password
        const {error} = User.validatePasswordReset(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        //Obtener usuario con el token
        const CurrentUser = await User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: {$gt: Date.now()}
        });
        if (!CurrentUser)
            return res.status(401).send('Password reset token is invalid or has expired.');
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //Actualizar password
        CurrentUser.password = hashedPassword;
        CurrentUser.resetPasswordToken = undefined;
        CurrentUser.resetPasswordExpires = undefined;
        await CurrentUser.save();
        //Enviar email de confirmación
        const transporter = nodemailer.createTransport({
            host : process.env.CPANEL_APP_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.CPANEL_APP_EMAIL,
                pass: process.env.CPANEL_APP_PASSWORD,
            },
        });
        const data = {
            from: process.env.CPANEL_APP_EMAIL,
            to: CurrentUser.email,
            subject: 'Password Reset Successfully',
            html: `
            <h2>Your password has been reset successfully.</h2>`
        };
        transporter.sendMail(data, (err) => {
            if (err) {
                console.log("error transporter", err)
                return res.status(500).send({message: err.message});
            }
            return res.status(200).send({message: 'Your password has been reset successfully.'});
        });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}
