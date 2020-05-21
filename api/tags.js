const tagsRouter = require('express').Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");
    next();
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;
    console.log(tagName)
    try {
        const postsWithTagName = await getPostsByTagName(tagName);

        const posts = postsWithTagName.filter(post => {
            if (post.active && (req.user && post.author.id === req.user.id)) {
                return true
            } else {
                return false;
            };
        });
        
        res.send({ posts });

    } catch ({ name, message }) {
        next({ name, message });
    };
});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();
    res.send({
        tags
    });
});

module.exports = tagsRouter;