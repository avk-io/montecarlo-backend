function success(res,data){
    return res.status(200).json({
        success:true,
        data
    })
}

function error(res,code,message){
    return res.status(code).json({
        success:false,
        message:message
    })
}

module.exports = {success,error}