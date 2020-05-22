const usersRouter = require('express').Router();
const { requireUser, requireActiveUser } = require('./utils');
const { getAllUsers, getUserByUsername, createUser, updateUser } = require('../db');
const jwt = require('jsonwebtoken');

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
    next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    };

    try {
        const user = await getUserByUsername(username);

        if (user && user.password == password) {
            const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });
            console.log(token)
            res.send({ 
                message: "You're logged in!", 
                token
            });
        } else {
            next({
                name: "IncorrectCredentialsError",
                message: "Username or password is incorrect"
            });
        };
    } catch (error) {
        console.log(error);
        next(error);
    };
});

usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: "UserExistsError",
                message: "A user by that username already exists"
            });
        };

        const user = await createUser({ username, password, name, location });

        const token = jwt.sign({ 
            id: user.id, 
            username 
        }, process.env.JWT_SECRET, { 
            expiresIn: '1w' 
        });

        res.send({
            message: "Thank you for signing up!",
            token
        });

    } catch ({ name, message }) {
        next({ name, message });
    };
});

usersRouter.delete('/:userId', requireActiveUser, async (req, res, next) => {
    const { userId } = req.params;
    const user = req.user;
    try {
        if (user && user.id === Number(userId)) {
            const deactivatedUser = await updateUser(user.id, {active: false });
            res.send({ deactivatedUser });
            console.log("Deactivated User: ", deactivatedUser);
        } else {
            next({
            name: "DeleteUserError",
            message: "You cannot delete a username that is not yours"
            })
        };
    } catch ({ name, message }) {
        next({ name, message });
    };
});

usersRouter.patch('/:userId', requireUser, async (req, res, next) => {
    const { userId } = req.params;
    const user = req.user;
    console.log("UserId: ", userId)
    console.log('Req.user: ', req.user)
    console.log("Req.user.id: ", req.user.id)
    try {
        if (user && user.id === Number(userId)) {
            const activatedUser = await updateUser(user.id, {
                active: true 
            });
            res.send({ activatedUser });
            console.log("Activated User: ", activatedUser);
        } else {
            next({
            name: "ActivateUserError",
            message: "You cannot activate a username that is not yours"
            })
        };
    } catch ({ name, message }) {
        next({ name, message });
    };
});

module.exports = usersRouter;