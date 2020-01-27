const rp = require('request-promise')
const APPID = 'wx728923e02bc8ba9d'
const APPSECRET = 'f1cc2ebb005ecaafd586d467fc478039'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`

const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, './access_token.json')
const updateAccessToken = async () => {
    const resStr = await rp(URL)
    const res = JSON.parse(resStr)
    // console.log(res)
    if(res.access_token) {
        fs.writeFileSync(fileName, JSON.stringify({
            access_token: res.access_token,
            createTime: new Date()
        }))
    } else {
        await updateAccessToken()
    }
}

const getAccessToken = async () => {
    try {
        const readRes = fs.readFileSync(fileName, 'utf8')
        const readObj = JSON.parse(readRes)

        const createTime = new Date(readObj.createTime).getTime()
        const now = new Date().getTime()
        if ((now - createTime) / 1000 / 60 / 60 >= 2) {
            await updateAccessToken()
            await getAccessToken()
        }
        return readObj.access_token
    } catch (error) {
        await updateAccessToken()
        await getAccessToken()
    }
}

setInterval(async () => {
    await updateAccessToken()
}, (7200 - 300) * 1000)

module.exports = getAccessToken