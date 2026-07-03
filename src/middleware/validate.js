const { error } = require("../utils/response")

const validate = (schema) => (req,res,next)=>{
    const result = schema.safeParse(req.body);

    if(!result.success){
        return error(res,422,result.error.issues[0].message)
    }

    req.body = result.data;
    next();
};

module.exports = validate;