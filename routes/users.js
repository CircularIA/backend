const router = require('express').Router();
const {User, validate} = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    try{
        console.log(req.body)
        const {error} = validate(req.body);
        if(error)
            return res.status(400).send(error.details[0].message);
        
        const user = await User.findOne({email: req.body.email});
        if(user)
            return res.status(409).send('User already registered.');
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await new User({...req.body, password: hashedPassword}).save();
        res.status(201).send('User created.');

    } catch(error){
        console.log(error)
        res.status(500).send({message: 'Internal Server Error'});
    }
});

module.exports = router;