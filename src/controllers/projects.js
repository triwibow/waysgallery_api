const { User, Transaction, TransactionUser, Project, ProjectPhoto } = require('../../models');
const Joi = require('joi');
const { moveFile, deleteFile } = require('../helper/file');

const sendProject = async (req, res) => {
    try {

        const { body, files } = req;

        const schema = Joi.object({
            transactionId: Joi.number().required(),
            description: Joi.string().required(),
        });

        const { error } = schema.validate(body);

        if(error){
            files.forEach(file => {
                deleteFile('tmp/project', file.filename);
            })
            return res.send({
                status: 'error',
                error: {
                    message: error.message
                }
            });
        }

        const addPost = await Project.create({
            ...body
        });


        const photos = [];

        files.forEach(file => {
            photos.push({
                projectId: addPost.id,
                image:file.filename
            });
        });

        await ProjectPhoto.bulkCreate(photos);

        const project = await Project.findOne({
            where:{
                id: addPost.id
            },
            include: {
                model:ProjectPhoto,
                as:'photos'
            }
        })

        files.forEach(file => {
            moveFile('project', file.filename);
        });

        res.send({
            status: 'success',
            data: {
                project
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

const viewProject = async (req, res)=> {
    try {
        const { transactionId } = req.params;

        const project = await Project.findAll({
            where: {
                transactionId
            },
            attributes:{
                exclude:['transactionId', 'createdAt', 'updatedAt']
            },
            include: {
                model:ProjectPhoto,
                as:'photos',
                attributes:{
                    exclude:['ProjectId','projectId', 'createdAt', 'updatedAt']
                },
                
            }
        });

        if(!project){
            return res.send({
                status: "error",
                error:{
                    message:"Resource not found"
                }
                
            });
        }

        res.send({
            status: "success",
            data:{
                project
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

exports.sendProject = sendProject;
exports.viewProject = viewProject;