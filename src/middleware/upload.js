const multer = require('multer');

const upload = (fields) => {

    
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log(file);        
            switch(file.fieldname){
                case "photo":
                    cb(null, 'uploads/tmp/photo');
                    break;
                case "art":
                    cb(null, 'uploads/tmp/art');
                    break;
                case "project":
                    cb(null, 'uploads/tmp/project');
                    break;
                case "avatar":
                    cb(null, 'uploads/tmp/avatar');
                    break;
                default:
                    break;
            }
            
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    

    const fileFilter = (req, file, cb) => {
        
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = {
                message: "Only image files are allowed!",
            };
            return cb(new Error("Only image files are allowed!"), false);
        }
        

        cb(null, true);
    }



    const maxSixe = 5 * 1000 * 1000;

    const doUpload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSixe
        },
    }).array(fields);


    return (req, res, next) => {
        
        doUpload(req, res, (err) => {
            if(req.fileValidationError){
                const message = req.fileValidationError.message;
                return res.send({
                    status: "error",
                    error: {
                        message
                    }
                    
                });
            }

            if(!req.files && !err){
                return res.send({
                    status: 'error',
                    message: "Please select file to upload"
                });
            }

            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.send({
                        status: "error",
                        message: "Max file sized 10MB",
                    });
                }
                return res.send({
                    status: "error",
                    message: err
                });
            }

            return next();
        });
        
    }
}

exports.upload = upload;