const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Pankaj2608:Pankajjaat2608@pankaj.f0v1p.mongodb.net/')

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String

})
const User = mongoose.model("User", UserSchema)


module.exports = {
    User
}