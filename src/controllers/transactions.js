const { User, Transaction, TransactionUser } = require('../../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const addTransaction = async (req, res) => {
    try {
        const { id } = req.user;
        const { body } = req;

        const schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            price: Joi.number().required(),
            orderTo: Joi.number().required()
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

        const {title, description, startDate, endDate, price, orderTo } = body; 

        const addPost = await Transaction.create({
            title,
            description,
            startDate,
            endDate,
            price,
            status:'Waiting Accept'
        });

        await TransactionUser.create({
            transactionId: addPost.id,
            orderByUserId:id,
            orderToUserId:orderTo
        });

        const hired = await Transaction.findOne({
            where:{
                id: addPost.id
            },
            attributes:{
                exclude:['createdAt', 'updatedAt', 'id', 'status']  
            },
            include:[
                {
                    model:User,
                    as:'orderBy',
                    attributes:{
                        exclude:['createdAt', 'updatedAt', 'password', 'greeting', 'avatar',]  
                    },
                    through: {
                        attributes:[]
                    }
                },
                {
                    model:User,
                    as:'orderTo',
                    attributes:{
                      exclude:['createdAt', 'updatedAt', 'password', 'greeting', 'avatar',]  
                    },
                    through: {
                        attributes:[]
                    }
                }
            ]
        })

        res.send({
            status: "success",
            data: {
                hired
            }
            
        });

    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });
    }
}

const getTransactions = async(req, res) => {
    try {
        const { id } = req.user;

        if(!req.query.status){
            return res.send({
                status: "error",
                error:{
                    message:"Need status parameter"
                }
                
            });
        }

        let whereCondition = '';

        if(req.query.status === "my-order"){
            whereCondition = '$orderBy.id$';
        } else if(req.query.status === "my-offer"){
            whereCondition = '$orderTo.id$'
        } else {
            whereCondition = false
        }

        if(!whereCondition){
            return res.send({
                status: "error",
                error:{
                    message:"Invalid parameter"
                }
                
            });
        }

       
        const transactions = await Transaction.findAll({
            where:{
                [whereCondition]:{[Op.eq]:id}
            },
            attributes:{
                exclude:['createdAt', 'updatedAt']  
            },
            include:[
                {
                    model:User,
                    as:'orderBy',
                    attributes:{
                        exclude:['createdAt', 'updatedAt', 'password', 'greeting', 'avatar',]  
                    },
                    through: {
                        attributes:[]
                    }
                },
                {
                    model:User,
                    as:'orderTo',
                    attributes:{
                      exclude:['createdAt', 'updatedAt', 'password', 'greeting', 'avatar',]  
                    },
                    through: {
                        attributes:[]
                    }
                }
            ]
        });

        res.send({
            status: "success",
            data: {
                transactions
            }
            
        });

    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });
    }

}

const editTransaction = async (req, res) => {
    try {

        const {transactionId} = req.params;
        const { body } = req;

        const schema = Joi.object({
            status: Joi.string().required()
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
        
        const transactionById = await Transaction.findOne({
            where: {
                id: transactionId
            }
        });

        if(!transactionById){
            return res.send({
                status: "error",
                error: {
                    message: "Resource not found"
                }
            })
        }

        const { status } = body;
        await Transaction.update({
            status
        }, {
            where: {
                id: transactionId
            }
        });

        const transaction = await Transaction.findOne({
            where:{
                id:transactionId
            }
        });

        res.send({
            status: "success",
            data: {
                transaction
            }
        });



    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });
    }
}

exports.addTransaction = addTransaction;
exports.getTransactions = getTransactions;
exports.editTransaction = editTransaction;