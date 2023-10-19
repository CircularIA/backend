const {Branch} = require('../models/branch');
const { User} = require('../models/user');
const {Company} = require('../models/company');
const getBranch = async (req, res) => {
    try {
        //Depending of the user type and the user id, we have to return the branches
        //How this endpoint pass for the middle ware, we can obtain the user id
        const {user} = req;
        const findUser = await User.findById(user._id).populate('company').populate('departament');
        if (!findUser) return res.status(400).send({ message: 'User not found' });
        console.log("user", findUser)
        // *if user is type 0, return whole branch
        if (findUser.type === 0){
            const branches = await Branch.find();
            if (!branches) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches });
        } else if(findUser.type === 1){
            console.log("es tipo 1")
            // *This is a owner user, just return branch of the company associate it
            //The branches are associate with company atribute
            const dataCompany = await Company.findById(findUser.company._id).populate('branches');
            if (!dataCompany) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches: dataCompany.branches });
        } else{
            //*This is for restricted user, just return the branch associate with the departament
            //The departament is associate with the user
            const branches = await Branch.findById(findUser.departament.branch);
            if (!branches) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches });
        }
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = { getBranch };