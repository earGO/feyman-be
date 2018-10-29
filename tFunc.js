const shouldShow = (hasTags,needTags) => {
    let res=[];
    needTags.map(tag => {
        res.push(hasTags.includes(tag))
    })
    return !res.includes(false)
}

module.exports = shouldShow;