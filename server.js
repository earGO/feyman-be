
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const Promise = require('bluebird');
const afetch = require('node-fetch');

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

/*an endpoint that fills each post's tagplate with tags inside ItemList component*/
app.get('/ptags/:id', (req,res) => {
    const {id} =req.params;
    db.select('*').from('publ_post_tags_v2')
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

/*an endpoint that fills each post's tag4sort array with tags ids inside ItemList component
* for tag filtering implementation
* for practice i implemented it through async/await and its freaking AWESOME*/
app.get('/ptagsa/:id', async (req,res) => {
    const {id} =req.params;
    let tagsArray=[]
    let answers = await db.select('post_tag_ids').from('publ_post_tags_v2')
        .where({
            post_id: id
        })
     answers.map(answer => {
         tagsArray.push(answer.post_tag_ids)
     })
    res.json(tagsArray)
})

/*get all tags*/
app.get('/admin/tags/', (req,res) => {
    db.select('*').from('tags_v1')
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
    const {post_title, post_short, articles} = req.body;
    db.transaction(trx => {
        db('posts_v1')
            .returning('ID')
            .insert({
                title:post_title,
                short:post_short,
                date: new Date()
            })
            .then((ID) => {
                const promises = articles.map(article => {
                    return db('articles_v1')
                        .insert({
                            a_title: article.articleTitle,
                            body:article.articleBody,
                            article_image: article.articleImage,
                            article_url:article.articleUrl,
                            post_id:ID[0]
                        });
                    });
                return Promise.all(promises)
        })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .catch(err => console.log('transaction failed, rollback' + err));


})

/*with .map
 db.transaction(trx => {
        db('posts_v1')
            .returning('ID')
            .insert({
                title: post_title,
                short:post_short,
                date: new Date()
            })
            .then((ID) => {
                const promises = articles.map(article => {
                    return db('articles_v1')
                        .insert({
                            a_title: article.a_title,
                            body:article.body,
                            article_image: article.article_image,
                            article_url:article.article_url,
                            post_id:ID[0]
                        });
                    });
                return Promise.all(promises)
            })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .catch(err => console.log('transaction failed, rollback' + err));
*
* */
app.post('/admin/addpostwtags', (req,res) => {
    const {post_title, post_short, articles, tags} = req.body;
    console.log(tags)
    db.transaction(trx => {
        db('posts_v1')
            .returning('ID')
            .insert({
                title:post_title,
                short:post_short,
                date: new Date()
            })
            .then((ID) => {
                let aPubl=[];
                articles.forEach(article => {
                    aPubl.push(db('articles_v1')
                        .insert({
                            a_title: article.articleTitle,
                            body:article.articleBody,
                            article_image: article.articleImage,
                            article_url:article.articleUrl,
                            post_id:ID[0]
                        }))
                });
                tags.forEach(tag => {
                    aPubl.push(db('post_tags')
                        .insert({
                            post_id: ID[0],
                            post_tag_ids:tag.tag_id
                        }))
                });
                return Promise.all(aPubl);
            })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .catch(err => console.log('transaction failed, rollback' + err));


})
/*also variant with forEach
db.transaction(trx => {
        db('posts_v1')
            .returning('ID')
            .insert({
                title: post_title,
                short:post_short,
                date: new Date()
            })
            .transacting(trx)
            .then((ID) => {
                let aPubl=[];
                articles.forEach(article => {
                    aPubl.push(db('articles_v1')
                        .insert({
                            a_title: article.a_title,
                            body:article.body,
                            article_image: article.article_image,
                            article_url:article.article_url,
                            post_id:ID[0]
                        }))
                });
                return Promise.all(aPubl);
            })
            .then(trx.commit)
            .then(console.log('transaction succssfull'))
            .catch(trx.rollback);
    })
        .catch(err => console.log('transaction failed' + err));


*
* */



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