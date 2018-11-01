
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const Promise = require('bluebird');
const afetch = require('node-fetch');

/*Controllers import*/

const addpostwtags = require('./Controllers/admin/addPostWTags');
const admintags = require('./Controllers/admin/tags');
const fullPost = require('./Controllers/fullPost');
const smartPost = require('./Controllers/smartPost.js');

const app = express();

/*Since this blog do not need to have signin and stuff, we can have pretty simple backend server
* Main issue will be in sorting data from database before sending it to frontend*/

const db = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'eargo',
        password : '12345',
        database : 'postgres'
    }
});

app.use(cors());
app.use(bodyParser.json());

/*send to frontend a JSON object with post data to process, created on backend
* this endpoint is for <ItemList> component of a frontend*/
app.get('/smart', (req,res) => {smartPost.handlePosts (req,res,db)})

/*an endpoint thad sends entire post data with articles and stuff*/
app.get('/post/:id', (req,res) => {fullPost.handleFullPost(req,res,db)})

/*Admin entrypoints part*/

/*get all tags to fill <TagSelector> when creating new post*/
app.get('/admin/tags/', (req,res) => {admintags.handleTagsAdmin(req,res,db)})

app.get('/admin', (req,res) => {
    res.json('connected to server');
})

/*an endpoint to add post to database*/
app.post('/admin/addpostwtags', (req,res) => {addpostwtags.handleAddPostWTags (req,res,db)})

app.get('/admin/isuser', (req,res) =>{
    db.select('*').from('users')
        .then(data => {
            console.log('succesfull fetch of users')
            if (data.length) {
                res.status(200).json(data)
            } else {
                res.status(200).json('user not found')
            }
        })
        .catch(err => res.status(400).json('error getting user'))
})

/*endpoints dummies

app.get('/books', (req,res) => {
    res.json('here we would send our book review data - using same itemlist and item component');
})

app.get('/projects', (req,res) => {
    res.json('here we would send our project entries data - using same itemlist and item component');
})

*/
app.listen(5500,()=>{
    console.log('app is running on port 3000');
})


/* A list of end-points for a backend
* / --> GET --> res = sends a list of first page posts (incl tags, title, and short text), as well as INTRO entry
* /post GET --> res = sends a list of articles< post title and tagplate for generating a post to show
* /books GET --> res = analogue of a root post-lists but on books.
* /projects GET --> res = analogue of a root posts-list, but on projects
*
* so we use ame articles-tags-posts components to generate different type of posts. separate links in
* "Books", "Projects" and "Articles" in the bottom folder will use the same tag system to filter related entries
* */