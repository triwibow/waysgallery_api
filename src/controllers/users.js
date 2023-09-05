const Joi = require('joi');
const { User, Post, Photo, Art } = require('../../models');
const { moveFile, deleteFile } = require('../helper/file');

const getUser = async (req,res) =>{

    try {
        const { id } = req.user;
        const user = await User.findOne({
            where: {
                id
            },
            attributes:{
                exclude:['updatedAt','createdAt', 'UserId', 'userId', 'password'],
            },
            include:[
                {
                    model: Post,
                    as:'posts',
                    attributes:{
                        exclude:['updatedAt','createdAt', 'UserId', 'userId'],
                    },
                    include: {
                        model:Photo,
                        as:'photos',
                        attributes:{
                            exclude:['updatedAt','createdAt', 'PostId', 'postId'],
                        },
                    }
                },
                {
                    model:Art,
                    as:"arts",
                    attributes:{
                        exclude:['updatedAt','createdAt', 'UserId', 'userId'],
                    },
                }
            ]
        });

        if(!user){
            return res.send({
                status: 'error',
                error: {
                    message: "Resource not found"
                }
            });
        }

        res.send({
            status: "success",
            data : {
                user
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

const editUser = async (req, res) => {
    try {
        const {id} = req.user;

        const {body, files} = req;

        const data = (files.length > 0) ? {
            ...body,
            avatar: files[0].filename
        }:{
            ...body
        }

        const schema = Joi.object({
            fullName: Joi.string().required(),
            greeting: Joi.string().allow('')
        });


        const { error } = schema.validate(body);

        if(error){
            if(files.length > 0){
                deleteFile('tmp/avatar', files[0].filename);
            }
            return res.send({
                status: 'error',
                error: {
                    message: error.message
                }
            });
        }

        const userDb = await User.findOne({
            where: id
        });


        if(!userDb){
            return res.send({
                status: 'error',
                error: {
                    message: "Resource not found"
                }
            });
        }
        

        const doUpdate = await User.update({
            ...data
        }, {
            where: {
                id
            }
        });



        if(doUpdate > 0){
            if(files.length > 0){
                deleteFile('avatar', userDb.avatar);
                moveFile('avatar', data.avatar);
            }

            const user = await User.findOne({
                where: {
                    id
                },
                attributes:{
                    exclude:['password']
                }
            });

            res.send({
                status:"success",
                data: {
                    user
                }
            });
        } else {
            return res.status(500).send({
                status: "error",
                error: {
                    message: "server error"
                }
            });
        }

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

const uploadArt = async (req, res) => {
    try {

        const { id } = req.user;
        const { files } = req;

        const photos = [];

        files.forEach(file => {
            photos.push({
                userId:id,
                image:file.filename
            })
        });

        await Art.bulkCreate(photos);


        files.forEach(file => {
            moveFile('art', file.filename);
        });

        res.send({
            status: "success",
            data : {
                id
            }
        });

    }catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });
    }
}

const getUserById = async (req,res)=>{
    try {
        const { id } = req.user;
        const { userId } = req.params;

        if(id == userId){
            return res.send({
                status: 'error',
                error: {
                    message: "Resource not found"
                }
            });
        }

        const user = await User.findOne({
            where: {
                id:userId
            },
            attributes:{
                exclude:['updatedAt','createdAt', 'UserId', 'userId', 'password'],
            },
            include:[
                {
                    model: Post,
                    as:'posts',
                    attributes:{
                        exclude:['updatedAt','createdAt', 'UserId', 'userId'],
                    },
                    include: {
                        model:Photo,
                        as:'photos',
                        attributes:{
                            exclude:['updatedAt','createdAt', 'PostId', 'postId'],
                        },
                    }
                },
                {
                    model:Art,
                    as:"arts",
                    attributes:{
                        exclude:['updatedAt','createdAt', 'UserId', 'userId'],
                    },
                }
            ]
        });

        if(!user){
            return res.send({
                status: 'error',
                error: {
                    message: "Resource not found"
                }
            });
        }

        res.send({
            status: "success",
            data : {
                user
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

exports.getUser = getUser;
exports.editUser = editUser;
exports.getUserById = getUserById;
exports.uploadArt = uploadArt;