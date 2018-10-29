
const handleAddPost = (req,res,db) =>{

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



}

module.exports = {
    handleAddPost
}