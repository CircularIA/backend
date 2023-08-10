const router = require('express').Router();
const nodeMailer = require('nodemailer');

const password = 'krzjpyhsppytxvme';
const config = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'prosperseia@gmail.com',
        pass: password,
    }
}

const send = (data) => {
    const transporter = nodeMailer.createTransport(config);
    transporter.sendMail(data, (error, info) => {
        if (error) {
            console.log(error);
        } else{
            return info.response;
        }
    }); 
}
const dataExample = {
    "from": "sender@gmail.com",
    "to": "example@gmail.com",
    "subject": "Hello",
    "text": "Hello world",
}

router.post('/', async (req, res) => {
    try {
        const { 
            relation,
            name,
            represent,
            email, 
            message 
        } = req.body;
        const data = {
            to: 'prosperseia@gmail.com',
            subject: 'Contacto desde la página web',
            html: '<h2> Contacto de:' + name + '</h2>' + '<p> El nombre: ' + name + '</p>' + '<p>tiene una relación: ' + relation + '</p>' + '<p> viene en nombre de representación: ' + represent + '</p>' + '<p> y el email que ingresó es: ' + email + '</p><br/>' + '<p> Mensaje: ' + message + '</p>'
        }
        const response = await send(data);
        res.status(200).send({ message: 'Email sent successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

//krzjpyhsppytxvme
module.exports = router;