const express = require("express")
const bodyParsar = require("body-parser")
const app = express();
const userRouter = require("./routes/user")



app.use(bodyParsar.json())
app.use("/user", userRouter)




const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`server is running on the ${PORT}`)

})