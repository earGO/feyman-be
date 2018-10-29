
const handlePostTags = (req,res,db) => {
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



}

module.exports = {
    handlePostTags
}