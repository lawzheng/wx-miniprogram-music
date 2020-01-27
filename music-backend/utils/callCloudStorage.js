const getAccessToeken = require('../utils/getAccessToken')
const rp = require('request-promise')

const callCloudDB = async (ctx, fnName, query = {}) => {
    const access_token = await getAccessToeken()
    const url = `https://api.weixin.qq.com/tcb/${fnName}?access_token=${access_token}`

    const options = {
        method: 'POST',
        uri: url,
        body: {
            ...query,
            env: ctx.state.env
        },
        json: true // Automatically stringifies the body to JSON
    };
    
    return await rp(options)
        .then((res) => {
            return res
        })
        .catch(function (err) {
            // POST failed...
        });
}

module.exports = callCloudDB