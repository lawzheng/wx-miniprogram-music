const getAccessToeken = require('../utils/getAccessToken')
const rp = require('request-promise')


const callCloudFn = async (ctx, fnName, params) => {
    const access_token = await getAccessToeken()
    const url = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${access_token}&env=${ctx.state.env}&name=${fnName}`

    const options = {
        method: 'POST',
        uri: url,
        body: params,
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

module.exports = callCloudFn