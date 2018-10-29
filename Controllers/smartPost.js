
const handlePosts = async(req,res,db) => {
    let postsIDs = [];
    let rawPostsArray=[]; /*this is array with requests from a 'posts_v1' table*/
    let megaPostsArray=[];
    let quazyMegaPostArray=[];

    /*fetch some data to rrays to work with*/
    let rawPosts = await db.select('*').from('short_post')
        .catch(err => res.status(400).json('error getting post'));
    await rawPosts.map(post => {
        rawPostsArray.push(post)
        })
    rawPosts.map(post => {
        if (!postsIDs.includes(post.post_id)){
            postsIDs.push(post.post_id)
        }
    })
    await postsIDs.map(ID => {
        let constructedPostsArray=[];
        rawPostsArray.map(post =>{
            if(post.post_id===ID){
                constructedPostsArray.push(post)
            }
        })
        megaPostsArray.push(constructedPostsArray)
    })
    /*now we have nice and sweet array, and each it's tem is array of all records,
    * containing title, short, tag name and tag img url, that have same post_id
    *
    * now i'm gonna rework this array to another form, so each item will contain single fields
    * post_id, title, short, and an array of tags. This way I can feed them to
    * appropriate components whithout hard logic in front-end app.*/
    megaPostsArray.map(megaitem => {
        let constrArr=[];
        let postOwnTagArray=[];
        megaitem.map(item => {
            let smll=[]
            smll.push(item.name)
            smll.push(item.img)
            postOwnTagArray.push(smll)
        })
        constrArr.push(megaitem[0].post_id)
        constrArr.push(megaitem[0].title)
        constrArr.push(megaitem[0].short)
        constrArr.push(postOwnTagArray)
        quazyMegaPostArray.push(constrArr)
        console.log(constrArr)
    })


    res.json(quazyMegaPostArray.sort())
}

module.exports = {
    handlePosts
}