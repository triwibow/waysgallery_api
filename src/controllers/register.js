const { User } = require('../../models');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { body } = req;

        const schema = Joi.object({
            email: Joi.string().email().required(),
            fullName: Joi.string().required(),
            password: Joi.string().required()
        });

        const { error } = schema.validate(body);

        if(error){
            return res.send({
                status: 'error',
                error: {
                    message: error.message
                }
            });
        }

        const checkEmail = await User.findOne({
            where: {
                email: body.email
            }
        });

       

        if(checkEmail){
            return res.send({
                status: 'error',
                error: {
                    message: "Email is already registered"
                }
            });
        }


        const { email, fullName, password } = body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            fullName,
            avatar: "default.jpg",
            greeting: "",
            password: hashedPassword
        });

        const privateKey = process.env.JWT_PRIVATE_KEY;
        const token = jwt.sign(
            {
                id: user.id
            },
            privateKey
        );

        res.send({
            status: 'success',
            data: {
                user: {
                    email: user.email,
                    fullName: user.fullName,
                    token
                }
            }

        })

    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: 'error',
            error: {
              message: "Server Error",
            }
        });
    }

}


exports.register = register;