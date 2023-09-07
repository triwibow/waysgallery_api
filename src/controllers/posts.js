const { User, Post, Photo } = require('../../models');
const Joi = require('joi');
const { moveFile, deleteFile } = require('../helper/file');

const getPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            attributes:{
                exclude:['updatedAt','createdAt', 'userId'],
            },
            order: [
                ['id', 'DESC']
            ],
        
            include:[
                {
                    model: Photo,
                    as:'photos',
                    attributes:{
                        exclude:['updatedAt','createdAt', 'postId', 'PostId'],
                    },
                },
                {
                    model:User,
                    as: 'createdBy',
                    attributes:{
                        exclude:['updatedAt','createdAt', 'password', 'greeting'],
                    },
                }
           ]
        });

        if(!posts){
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
                posts
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

const getPostById = async (req,res) =>{

    try {
        const {postId} = req.params;
        const post = await Post.findOne({
            where: {
                id:postId
            },
            attributes:{
                exclude:['updatedAt','createdAt', 'UserId', 'userId'],
            },
        
            include:[
                {
                    model: Photo,
                    as:'photos',
                    attributes:{
                        exclude:['updatedAt','createdAt', 'postId', 'PostId'],
                    },
                },
                {
                    model:User,
                    as: 'createdBy',
                    attributes:{
                        exclude:['updatedAt','createdAt', 'password', 'greeting'],
                    },
                }
           ]
        });

        if(!post){
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
                post
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

const addPost = async (req, res) => {
    try {

        const { id } = req.user;
        const { body, files } = req;
       

        const schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
        });

        const { error } = schema.validate(body);

        if(error){
            files.forEach(file => {
                deleteFile('tmp/photo', file.filename);
            })
            return res.send({
                status: 'error',
                error: {
                    message: error.message
                }
            });
        }

        const addPost = await Post.create(
            {
                ...body,
                userId: id
            }
        );

        const photos = [];

        files.forEach(file => {
            photos.push({
                postId: addPost.id,
                image:file.filename
            })
        });

        await Photo.bulkCreate(photos);

        const post = await Post.findOne({
            where: {
                id:addPost.id
            },
            attributes:{
                exclude:['updatedAt','createdAt', 'UserId', 'userId'],
            },
        
            include:[
                {
                    model: Photo,
                    as:'photos',
                    attributes:{
                        exclude:['updatedAt','createdAt', 'postId', 'PostId'],
                    },
                }
           ]
        });

        files.forEach(file => {
            moveFile('photo', file.filename);
        });

        res.send({
            status: "success",
            data : {
                post
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

exports.getPosts = getPosts;
exports.getPostById = getPostById;
exports.addPost = addPost;