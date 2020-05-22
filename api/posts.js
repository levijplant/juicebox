const postsRouter = require('express').Router();
const { requireUser, requireActiveUser } = require('./utils');
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

    next();
});

postsRouter.post('/', requireActiveUser, async (req, res, next) => {
    const { title, content, tags ="" } = req.body;

    const tagArr = tags.trim().split(/\s+/);

    try {
        const postData = { authorId: req.user.id, title, content };

        if (tagArr.length) {
            postData.tags = tagArr;
        };
    
        const post = await createPost(postData);

        if (post) {
            res.send({ post });
        } else {
            next({
                name: "PostError",
                message: "Error creating post, fill out all required fields"
            });
        };

    } catch ({ name, message }) {
        next({ name, message});
    };
});

postsRouter.patch('/:postId', requireActiveUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    };

    if (title) {
        updateFields.title = title;
    };

    if (content) {
        updateFields.content = content;
    };

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost });
        };
    } catch ({ name, message}) {
        next({name, message});
    };
});

postsRouter.delete('/:postId', requireActiveUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, {active: false });
            res.send({ post: updatedPost});
        } else {
            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            });
        }

    } catch ({ name, message }) {
        next({ name, message });
    };
});

postsRouter.get('/', async (req, res, next) => {
    try {
        const allPosts = await getAllPosts();

        const posts = allPosts.filter(post => {
            if ((post.active || (req.user && post.author && post.author.id === req.user.id)) && post.author.active) {
                return true;
            } else {
                return false;
            };
        });

        res.send({ posts });
    } catch ({ name, message }) {
        next({ name, message });
    };
});

postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();
    
    res.send({
        posts
    });
});

postsRouter.post('/', requireUser, async (req, res, next) => {
    res.send({ message: "Under construction"});
});

module.exports = postsRouter;