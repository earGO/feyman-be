
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


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

console.log(db.select('*').from('posts_v1').data);

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
    const {id} = req.params;
    db.select('*').from('posts_v1')
     .then(data => {
        console.log('succesfull fetch of posts')
        if (data.length) {
            res.json(data)
        } else {
            res.status(400).json('post data not found')
        }
    })
        .catch(err => res.status(400).json('error getting post'))
})

app.get('/post/:id', (req,res) => {
    const {id} = req.params;
    db.select('*').from('articles_v1').where({
        post_id: id
    }).orderBy('art_id', 'asc')
        .then(post => {
        console.log(post)
        if (post.length) {
            res.json(post)
        } else {
            res.status(400).json('post not found')
        }
    })
        .catch(err => res.status(400).json('error getting post'))
})


app.get('/ptags/:id', (req,res) => {
    const {id} =req.params;
    db.select('*').from('publ_post_tags')
        .where({
            post_id: id
        })
        .then(tags => {
            if (tags.length) {
                res.json(tags)
            } else {
                res.status(400).json('post not found')
            }
        })
        .catch(err => res.status(400).json('error getting taglist'))

})

app.get('/books', (req,res) => {
    res.json('here we would send our book review data - using same itemlist and item component');
})

app.get('/projects', (req,res) => {
    res.json('here we would send our project entries data - using same itemlist and item component');
})

/*Admin entrypoints part*/
app.get('/admin', (req,res) => {
    res.json('connected to server');
})

app.post('/admin/addpost', (req,res) => {
    const {post_title, post_short, a_title, article_body, article_image, article_url} = req.body;
    db.transaction(trx => {
        trx.insert({
            title:post_title,
            date: new Date(),
            short:post_short
        })
            .into('posts_v1')
            .returning('ID')
            .then(postID => {
                return trx('articles_v1')
                    .returning('*')
                    .insert({
                        a_title: a_title,
                        post_id: postID[0],
                        body: article_body,
                        article_image: article_image,
                        article_url:article_url
                    })
                    .then(post => {
                        res.json(post[0]);
                    })
            }).then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('unable to register'))

})


app.listen(3000,()=>{
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