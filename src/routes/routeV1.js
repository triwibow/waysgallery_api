const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { register } = require('../controllers/register');
const { login } = require('../controllers/login');
const { checkAuth } = require('../controllers/checkAuth');

const { getPosts, getPostById, addPost } = require('../controllers/posts');
const { getUser, editUser, getUserById, uploadArt } = require('../controllers/users');
const { upload } = require('../middleware/upload');
const { addTransaction, getTransactions, editTransaction } = require('../controllers/transactions');
const { sendProject, viewProject } = require('../controllers/projects');

// register
router.post('/register', register);

// login
router.post('/login', login);

// auth 
router.get('/auth', auth, checkAuth);

// post
router.get('/posts', auth, getPosts);
router.get('/post/:postId', auth, getPostById);
router.post('/post', auth, upload('photo'), addPost)

// user 
router.get('/user', auth, getUser);
router.get('/user/:userId', auth, getUserById);
router.put('/user', auth, upload('avatar'), editUser);
router.post('/upload-art', auth, upload('art'), uploadArt);

// transaction
router.post('/hired', auth, addTransaction);
router.get('/transactions', auth, getTransactions);
router.put('/transaction/:transactionId', auth, editTransaction);

// project 
router.post('/project', auth, upload('project'), sendProject);
router.get('/project/:transactionId', auth, viewProject);

module.exports = router;