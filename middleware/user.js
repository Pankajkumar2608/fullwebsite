const { User } = require("../db");


function userMiddleware(res,req,next){
    const username = req.headers.username;
    const password = req.headers.password;
    User.findOne({
        username : username,
        password : password
    }).then(function(value){
        if(value){
            next();
        }
        else{
            res.status(403).json({
                msg:"User does not exist"
            })
        }

    })

}

module.exports = userMiddleware