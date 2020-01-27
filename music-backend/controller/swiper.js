const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB')
const callCloudStorage = require('../utils/callCloudStorage')
const fs = require('fs')
const rp = require('request-promise')

router.get('/list', async (ctx, next) => {    
    const query = `db.collection('swiper').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    // console.log(res.data)
    let fileList = []
    const dbResult = res.data
    dbResult.forEach(item => {
        const data = JSON.parse(item)
        fileList.push({
            fileid: data.fileid,
            'max_age': 7200
        })
    })
    const fileResult = await callCloudStorage(ctx, 'batchdownloadfile', {
        file_list: fileList
    })
    let returnData = []
    fileResult.file_list.forEach((item, index) => {
        returnData.push({
            fileid: item.fileid,
            download_url: item.download_url,
            _id: JSON.parse(dbResult[index])._id
        })
    })
    ctx.body = {
        data: returnData,
        code: 20000
    }
})

router.post('/upload', async (ctx) => {
    const file = ctx.request.files.file
    const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`
    const fileResult = await callCloudStorage(ctx, 'uploadfile', {path})
    const params = {
        method: 'POST',
        headers: {
            'content-type': 'multipart/form-data',
        },
        uri: fileResult.url,
        formData: {
            key: path,
            Signature: fileResult.authorization,
            'x-cos-security-token': fileResult.token,
            'x-cos-meta-fileid': fileResult.cos_file_id,
            file: fs.createReadStream(file.path)
        },
        json: true
    }
    await rp(params)
    const query = `db.collection('swiper').add({
        data: {
            fileid: '${fileResult.file_id}'
        }
    })`
    const res = await callCloudDB(ctx, 'databaseadd', query)
    console.log(res)
    ctx.body = {
        code: 20000,
        data: res.id_list
    }
})

router.post('/delBanner', async (ctx) => {
    const params = ctx.request.body
    const query = `db.collection('swiper').where({
        _id: '${params._id}'
    }).remove()`
    console.log(params)
    const res = await callCloudDB(ctx, 'databasedelete', query)
    const fileResult = await callCloudStorage(ctx, 'batchdeletefile', {
        fileid_list: [params.fileid]
    })
    console.log(fileResult)
    ctx.body = {
        code: 20000,
        data: {
            res,
            fileResult
        }
    }
})

module.exports = router