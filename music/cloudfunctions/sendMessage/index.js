// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function fmtTime (date) {
  let fmt = 'yyyy-MM-dd'
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分钟
    's+': date.getSeconds(), // 秒
  }

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, date.getFullYear())
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, o[k].toString().length == 1 ? '0' + o[k] : o[k])
    }
  }

  // console.log(fmt)
  return fmt
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
      data: {
        phrase2: {
          value: event.content
        },
        time1: {
          value: fmtTime(new Date())
        }
      },
      templateId: 'ygpQMok-53skEfgTXGMNEX3lBCAVNFKasRLvDnE-y5U'
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
  // const result = await cloud.openapi.templateMessage.send({
  //   touser: OPENID,
  //   page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
  //   data: {
  //     time1: {
  //       value: new Date()
  //     },
  //     phrase2: {
  //       value: event.content
  //     }
  //   },
  //   templateId: 'ygpQMok-53skEfgTXGMNEb7HkbyoWE4AcWZSpo3LOn0',
  //   formId: event.formId
  // })

  // return result
}