const Router = require('express-promise-router');

const router = new Router()

router.get('/aposts', async (req, res) => {
    const { rows } = await db.select('*').from('posts_v1')
    res.send(rows[0])
})



module.exports = router;