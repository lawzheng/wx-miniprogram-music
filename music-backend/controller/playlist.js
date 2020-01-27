const Router = require('koa-router')
const router = new Router()
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB')

router.get('/list', async (ctx, next) => {    
    const query = ctx.request.query
    const res = await callCloudFn(ctx, 'music', {
        $url: 'playlist',
        start: parseInt(query.start),
        count: parseInt(query.count)
    })
    let data = []
    if (res.resp_data) {
        data = JSON.parse(res.resp_data).data
    }
    ctx.body = {
        data,
        code: 20000
    }
})

router.get('/getById', async (ctx, next) => {
    const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    ctx.body = {
        data: JSON.parse(res.data[0]),
        code: 20000
    }
})

router.post('/update', async (ctx, next) => {
    const params = ctx.request.body
    const query = `db.collection('playlist').doc('${params._id}').update({
        data: {
            name: '${params.name}',
            copywriter: '${params.copywriter}'
        }
    })`
    const res = await callCloudDB(ctx, 'databaseupdate', query)
    console.log(res)
    ctx.body = {
        data: res,
        code: 20000
    }
})

router.get('/delPlaylist', async (ctx, next) => {
    const query = `db.collection('playlist').doc('${ctx.request.query._id}').remove()`
    const res = await callCloudDB(ctx, 'databasedelete', query)
    console.log(res)
    ctx.body = {
        data: res,
        code: 20000
    }
})




module.exports = router