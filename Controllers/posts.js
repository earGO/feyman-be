
const handlePosts = (req,res,db) => {

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
}

module.exports = {
    handlePosts
}