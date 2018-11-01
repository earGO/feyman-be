
const handleFullPost = (req,res,db) => {
    const {id} = req.params;
    db.select('*').from('articles_v1').where({
        post_id: id
    }).orderBy('art_id', 'asc')
        .then(post => {
            if (post.length) {
                res.json(post)
            } else {
                res.status(400).json('post not found')
            }
        })
        .catch(err => res.status(400).json('error getting post'))


}

module.exports = {
    handleFullPost
}