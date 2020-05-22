const {  
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    getPostById,
    getPostsByTagName,
    getAllTags,
    } = require('./index');

async function dropTables() {
    try {
        console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
    `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    };
};

async function createTables() {
    try {
        console.log("Starting to build tables...");

    await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            location varchar(255) NOT NULL,
            active boolean DEFAULT true
        );
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id),
            title varchar(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL
        );
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
        );
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error;
    };
};

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        await createUser({ 
            username: 'albert', 
            password: 'bertie99',
            name: 'Al Bert',
            location: 'Sidney, Australia' 
        });
        await createUser({ 
            username: 'sandra', 
            password: '2sandy4me',
            name: 'Tom Collins',
            location: 'Nunya, Business'
        });
        await createUser({ 
            username: 'glamgal',
            password: 'soglam',
            name: 'Craig Pelton',
            location: 'Upper East Side'
        });
        await createUser({ 
            username: 'footballgood',
            password: 'gojets',
            name: 'Jim Bob Cooter',
            location: 'East Rutherford, New Jersey'
        });

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
};

async function createInitialPosts() {
    try {
        const [ albert, sandra, glamgal, footballgood ] = await getAllUsers();

        console.log("Starting to create posts...");
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: [ "#worst-day-ever", "#youcandoanything" ]
        });

        await createPost({
            authorId: sandra.id,
            title: "How does this work?",
            content: "Seriously, does this even do anything?",
            tags: [ "#happy", "#worst-day-ever" ]
        });

        await createPost({
            authorId: glamgal.id,
            title: "Living the Glam Life",
            content: "Do you even? I swear that half of you are posing.",
            tags: ["#happy", "#youcandoanything", "#catmandoeverything" ]
        });
        await createPost({
            authorId: footballgood.id,
            title: "Football is life!",
            content: "This is the Jets' year! You'll see!",
            tags: ["#happy", "#youcandoanything", "#catmandoeverything" ]
        });

        console.log("Finished creating posts!");
    } catch (error) {
        console.log("Error creating posts!");
        throw error;
    };
};

async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
    } catch (error) {
        console.log("Error during rebuildDB")
        throw error;
    };
};

async function testDB() {
    try {
        console.log("Starting to test database...");

        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        console.log("All Users:", users);

        console.log("Calling updateUser on users[0]");
        const updateUserResult = await updateUser(users[0].id, {
            username: 'groovyash',
            name: "Ashley Williams",
            location: "Elk Grove, Michigan"
        });
        console.log("Updated User:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("All Posts:", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "Deadites Everywhere!",
            content: "Klaatu barada nikto"
        });
        console.log("Updated Post:", updatePostResult);

        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("User One:", albert);

        console.log("Calling getPostsByUser with 1");
        const getPostsByUserResult = await getPostsByUser(1);
        console.log("User One Posts: ", getPostsByUserResult);

        console.log("Calling getPostById with 1");
        const postResult = await getPostById(1);
        console.log("Post One:", postResult); 

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: [ "#youcandoanything", "#redfish", "#bluefish" ]
        });
        console.log("Update Post Tags Result", updatePostTagsResult);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Posts with #happy:", postsWithHappy);

        console.log("Getting all tags");
        const allTags = await getAllTags();
        console.log("All Tags: ", allTags);

        console.log("Finished database tests!");
    } catch (error) {
        console.log("Error during testDB");
        throw error;
    }
};

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());