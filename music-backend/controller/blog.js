const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB')
const callCloudStorage = require('../utils/callCloudStorage')
const fs = require('fs')
const rp = require('request-promise')

router.get('/list', async (ctx, next) => {    
    const params = ctx.request.query
    const query = `db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createTime', 'desc').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    // console.log(res)
    ctx.body = {
        data: res.data,
        code: 20000
    }
})

router.post('/del', async (ctx, next) => {    
    const params = ctx.request.body
    console.log(params)
    // 删数据库
    const query = `db.collection('blog').doc('${params._id}').remove()`
    const res = await callCloudDB(ctx, 'databasedelete', query)
    // 删评论
    const commentQuery = `db.collection('blog-comment').where({
        blogId: '${params._id}'
    }).remove()`
    const commentRes = await callCloudDB(ctx, 'databasedelete', commentQuery)
    // 删相片
    let fileResult = {}
    if (params.img && params.img.length > 0) {
        fileResult = await callCloudStorage(ctx, 'batchdeletefile', {
            fileid_list: [params.img]
        })
    }
    ctx.body = {
        data: {
            res,
            commentRes,
            fileResult
        },
        code: 20000
    }
})

module.exports = router