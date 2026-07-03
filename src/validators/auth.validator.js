const { z } = require("zod")

const signupSchema = z.object({
    username:z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/,"Username should only contain letters,numbers and underscores"),
    password:z.string().min(8),
});

const loginSchema = z.object({
    username:z.string().min(1),
    password:z.string().min(1)
});

module.exports = {
    signupSchema,
    loginSchema
};