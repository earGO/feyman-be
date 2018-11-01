
const handleAddPostWTags = (req,res,db) => {

    const {post_title, post_short, articles, tags} = req.body;
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




}

module.exports = {
    handleAddPostWTags
}

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
