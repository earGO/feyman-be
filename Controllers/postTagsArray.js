
/*
* for practice i implemented it through async/await and its freaking AWESOME*/

const handlePostTagsArray = async (req,res,db) => {
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
}

module.exports = {
    handlePostTagsArray
}