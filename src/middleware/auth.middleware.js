const jwt = require("jsonwebtoken")
const {error} = require("../utils/response")

module.exports = (req,res,next)=>{
    const authHeader = req.headers.authorization
    if(!authHeader){
        return error(res,401,"No Token")
    }
    const accessToken = authHeader.split(" ")[1]

    try{
        const decoded = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        req.userId = decoded.userId
        next()
    }catch(err){
        return error(res,403,"Invalid Token")
    }
}