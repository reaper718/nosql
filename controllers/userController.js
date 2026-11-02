const Users = require('../models/users');

const addUser = (req,res) => {
    const { name, email, password } = req.body;

    const user = new Users(name, email, password);

    user.save()
        .then(user => {
            console.log("user created");
            return res.status(201).json({
                success: true,
                message: "user created !!!"
            })
        })
        .catch(err => {
            console.log(err);
        })
}

const getUser = (req,res) => {
    const {id} = req.params;

    Users.findById(id)
        .then(user => {
            console.log(user);
            return res.status(200).json({
                success: true,
                user: user
            })
        })
        .catch(err => {
            console.log(err);
        })
}

module.exports = {
    addUser,
    getUser
}