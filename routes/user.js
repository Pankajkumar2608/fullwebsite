const { Router } = require("express")
const userMiddleware = require("../middleware/user")
const router = Router();

router.post('./signup',userMiddleware,(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({
        username: username,
        password: password
    }).then(function(value){
        if(value){
            return `${username} already exist`

        }
        else{
            User.create({
                username: username,
                password: password
            }).then(function(){
                message: "user created successfully"
             
            }).catch(function(){
                message: "there is something wrong"
            })
        }
    })




})
router.post('. /signin',(req,res)=>{


    
})
module.exports = router;