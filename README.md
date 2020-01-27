# 微信小程序云开发



## 起步

微信公众平台注册、下载开发者工具等



## 云开发

创建时勾选

进工具 左上角点云开发 一步步开通

重新编译

一般要等个几分钟



## app.json

1. page添加页面，会自动生成对应文件

2. ```
   "window": {
       "backgroundColor": "#F6F6F6",
       "backgroundTextStyle": "light",
       "navigationBarBackgroundColor": "#d43c33",
       "navigationBarTitleText": "音乐",
       "navigationBarTextStyle": "white"
     },
     一看就懂 不用注释
   ```

3. ```
   "tabBar": {
       "color": "#474747",
       "selectedColor": "#d43c43",
       "list": [
         {
           "pagePath": "pages/playlist/playlist",
           "text": "音乐",
           "iconPath": "images/music.png",
           "selectedIconPath": "images/music-actived.png"
         },
         {
           "pagePath": "pages/blog/blog",
           "text": "发现",
           "iconPath": "images/blog.png",
           "selectedIconPath": "images/blog-actived.png"
         },
         {
           "pagePath": "pages/profile/profile",
           "text": "我的",
           "iconPath": "images/profile.png",
           "selectedIconPath": "images/profile-actived.png"
         }
       ]
     },
     同一看就懂
   ```

4. 全局属性

   ```
   this.globalData = {
         playingMusicId: -1,
         openid: -1
       }
   ```

   写全局方法去get\set

   ```
   setPlayMusicId(playingMusicId) {
       this.globalData.playingMusicId = playingMusicId
     },
     getPlayMusicId() {
       return this.globalData.playingMusicId
     },
   ```

   在页面中获取

   ```
   const app = getApp()
   
   app.xx即可
   ```

   

## Dom绑定事件

```
class="musiclist-container {{item.id === playingId ? 'playing': ''}}" 
动态class直接跟着写

bind:tap="onSelect" 
不能括号传参 要用tab事件 click有300ms延迟？猜测 没去查

传参方式 设置attribute
data-musicid="{{item.id}}" 
data-index="{{index}}"

在方法里获取
const musicId = event.currentTarget.dataset.musicid
const index = event.currentTarget.dataset.index
```

```
bind:catch 捕获
```







## 禁止页面滚动

对应页面json中

```
"disableScroll": true
```



## 暂停动画

```
animation-play-state: paused;
```





## 获取openid并存储

```
getOpenId () {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const openid = res.result.openid
      this.globalData.openid = openid
      if (wx.getStorageSync(openid) === '') {
        wx.setStorageSync(openid, [])
      }
    })
  }
  
  在app.js中调用即可
```





## app.wsxx

全局样式

引入别的样式 @import "xx.wsxx"



## 轮播图

```
<swiper indicator-dots="true" autoplay="true" interval="2000" duration="200" circular="true">
  <block wx:for="{{swiperImgUrls}}" wx:key="item.fileid">
    <swiper-item>
      <image src="{{item.fileid}}" mode="widthFix" class="img"></image>
    </swiper-item>
  </block>
</swiper>
```

建议用block包裹

image标签可以直接获取到云文件的图片 fileid

wx:key里的参数不用加{{}}











## 全局音乐

1. app.json

   ```
   "requiredBackgroundModes": [
   
       "audio"
   
    ],
   ```

2. ```
   const backgroundAudioManager = wx.getBackgroundAudioManager()
   ```

3. 绑定事件

   ```
   _bindBGMEvent () {
         backgroundAudioManager.onPlay(() => {
           isMoving = false
           this.triggerEvent('musicPlay')
         })
   
         backgroundAudioManager.onStop(() => {
           console.log()
         })
   
         backgroundAudioManager.onPause(() => {
           this.triggerEvent('musicPause')
         })
   
         backgroundAudioManager.onWaiting(() => {
           console.log()
         })
   
         backgroundAudioManager.onCanplay(() => {
           if (typeof backgroundAudioManager.duration !== 'undefined') {
             this._setTime()
           } else {
             setTimeout(() => {
               this._setTime()
             }, 1000)
           }
         })
   
         backgroundAudioManager.onTimeUpdate(() => {
           if (!isMoving) {
             const currentTime = backgroundAudioManager.currentTime
             const currentTimeFmt = this._dateFormat(currentTime)
             const percent = currentTime / backgroundAudioManager.duration
             const sec = currentTime.toString().split('.')[0]
             if (currentSec !== sec) {
               this.setData({
                 ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
                 movableDis: percent * (movableAreaWidth - movableViewWidth),
                 progress: percent * 100
               })
               currentSec = sec
               this.triggerEvent('timeUpdate', {
                 currentTime
               })
             }
           }
         })
   
         backgroundAudioManager.onEnded(() => {
           this.triggerEvent('musicEnd')
         })
   
         backgroundAudioManager.onError((res) => {
           console.log(res.errMsg)
           console.log(res.errCode)
           wx.showToast({
             title: '错误:' + res.errCode,
           })
         })
       },
   ```

   



## 获取dom元素

```
	  const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
```





## 组件

1. 在对应页面的json文件中加上

   ```
   "usingComponents": {
       "x-playlist": "/components/playlist/playlist"
     },
   ```

2. ```
   properties: {
       playlist: {
         type: Object
       },
       text: {
       	type: String,
       	value: ''
       }
     },
   ```

   跟vue prop类似 注意default 改为value

3. ```
   observers: {
       ['playlist.playCount'](count) {
         this.setData({
           _count: this._tranNumber(count, 2)
         })
       }
     },
    类似watch
    可以观察到对象中的属性
   ```

4. 分发事件

   ```
   this.triggerEvent('search', {
           keyword
         })
   bind:musicEnd="XX"
   keyword = event.detail.keyword
   
   原生事件
   bindtouchend 没冒号
   ```

5. 生命周期

   ```
   lifetimes: {
       ready() { // 钩子
         wx.getSystemInfo({
           success: function(res) {
             lyricHeight = res.screenWidth / 750 * 65
           },
         })
       }
     },
   ```

6. 获取外界css

   ```
   externalClasses: [
       'iconfont',
       'icon-sousuo'
     ],
     
    组件标签上
    iconfont="iconfont" icon-sousuo="icon-sousuo"
   ```

7. 插槽

   ```
   <slot name="modal-content"></slot>
   
   <view slot="modal-content">
       <button class="login"
         open-type="getUserInfo"
         bindgetuserinfo="onGotUserInfo"
       >获取微信授权信息</button>
     </view>
   ```

   









## 设置页面标题

1. ```
   动态设置
   wx.setNavigationBarTitle({
         title: music.name
       })
   ```

2. ```
   对应json
   "navigationBarTitleText": "正文"
   ```



## 获取用户信息

1. open-data 页面直接显示 只能显示自己的

   ```
   <open-data type="userNickName"></open-data>
   <open-data type="userAvatarUrl"></open-data>
   ```

   

2. wx.getUserInfo() 不支持弹出授权

3. button open-type 没openid

4. 云开发 自带login函数

   

````
wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              console.log(res)
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          this.setData({
            modalShow: true
          })
        }
      }
    })
````

用按钮调用

```
<button class="login"
      open-type="getUserInfo"
      bindgetuserinfo="onGotUserInfo"
    >获取微信授权信息</button>
```



## 格式化时间

```
module.exports = (date) => {
  let fmt = 'yyyy-MM-dd hh:mm:ss'
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
```

替换模板获得对应格式



## 跳转页面

1. js

```
wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
})
```

```
wx.navigateBack({})
```

2. 路由

   ```
   <navigator class="content" hover-class="none" url="/pages/profile-playhistory/profile-playhistory">
         <i class="iconfont icon-ziyuanldpi"></i>
         <text class="text">最近播放</text>
         <i class="iconfont icon-xiangyou"></i>
       </navigator>
   ```

   

## 格式化播放次数

```
/**
 * point保留小数位
 */
_tranNumber(num, point) {
      let numStr = num.toString().split('.')[0]
      if (numStr.length < 6) {
        return numStr
      } else if (numStr.length >= 6 && numStr.length <=8 ) {
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 - point)
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万'
      } else if (numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 - point)
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
      }
}
```



## 高斯模糊

```
.detail-container {
  height: 320rpx;
  filter: blur(40rpx);
  opacity: 0.4;
}
```

底下再用定位盖一层底色



## storage

```
wx.setStorageSync('musiclist', this.data.musiclist)

wx.getStorageSync('musiclist')
```

有分同步异步



## 上拉加载

1. 在对应页面的json文件中加上

   ```
   "enablePullDownRefresh": true
   ```

2. 在钩子中

   ```
   onReachBottom: function () {
       this._getPLaylist()
     },
   ```



## 下拉刷新

在对应钩子里

```
onPullDownRefresh: function () {
    this.setData({
      playlist: []
    })
    this._getPLaylist()
    this._getSwiper()
  },
```

获取到数据后

```
wx.stopPullDownRefresh()
```

将上方加载动画收回



## 全局组件

1. loading

   ```
   wx.showLoading({
         title: '加载中'
           mask: true,
   })
   wx.hideLoading()
   ```

2. modal

   ```
   wx.showModal({
         title: '授权用户才能发布',
         content: '',
       })
   ```

   

## 配置分享

```
在钩子函数
onShareAppMessage: function (event) {
    let blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`
    }
  }
```

### 按钮触发

```
<button open-type="share" data-blogid="{{blogId}}" data-blog="{{blog}}" class="share-btn" hover-class="share-hover">
      <i class="iconfont icon-fenxiang icon"></i>
      <text>分享</text>
    </button>
```



## 图片

### 上传

```
wx.chooseImage({
      count: MAX_IMG_NUM - this.data.images.length,
      sizeType: ['orginal', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths),
        })
        this.showAddImg()
      },
    })
```

### 预览

```	
wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
```

### 上传到云存储

```
wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item,
          success: (res) => {
            // console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve(res)
          },
          fail: err => {
            console.log(err)
            reject(err)
          }
        })
```



## 获取上一页面

```
const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()
```





## 配置订阅消息

### dom

```
<form slot="modal-content" report-submit="true" bind:submit="onSend">
    <textarea name="content" class="comment-content" placeholder="写评论" value="{{content}}" fixed="true"></textarea>
    <button class="send" form-type="submit">发送</button>
  </form>
```



### 点击获取权限

```
wx.requestSubscribeMessage({
        tmplIds: ['ygpQMok-53skEfgTXGMNEX3lBCAVNFKasRLvDnE-y5U'],
        success(res) {
        }
      })
```

### 云函数

config.json

```
{
  "permissions": {
    "openapi": [
      "subscribeMessage.send"
    ]
  }
}

```

```
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
```









## data

要显示到页面上的才放到data中，不显示的在外面定义变量

取法

```
this.data.xx
```

设置

```
this.setData({
	xx: xx
})

this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true,
        })
      })
```

不能频繁setData，会触发页面重绘





## 引入async await

runtime.js 见代码



## 调取云函数

```
wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'playlist',
        start: this.data.playlist.length,
        count: MAX_LIMIT
      }
    }).then(res => {
      console.log(res)
      this.setData({
        playlist: this.data.playlist.concat(res.result.data)
      })
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
```

$url 引入了tcb-router时 对应的router



## 限制一次100条

先判断长度，循环取出来拼接起来



# 云函数

## 最多50个 tcb-router

```
npm i tcb-router
```

```
// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

  app.router('playlist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        return res
      })
  })

  return app.serve()
}
```



## 模糊搜索

```
w = {
        content: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
      
      
.where(w)
```



## 定时运行

config.json

```
{
  "triggers": [
    {
      "name": "myTrigger",
      "type": "timer",
      "config": "0 0 10,14,16,23 * * * *"
    }
  ]
}
```



## ajax请求

```
npm i request request-promise

const rp = require('request-promise')
rp(url)
```







## 生成小程序码

云函数

```
{
  "permissions": {
    "openapi": [
      "wxacode.getUnlimited"
    ]
  }
}
```

```
const wxContext = cloud.getWXContext()
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID
    // lineColor: {
    //   'r': 211,
    //   'g': 60,
    //   'b': 57
    // },
    // isHyaline: true
  })
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    fileContent: result.buffer
  })
  return upload.fileID
```







# 后台系统

前后端分离

## 前端

使用vue ,vue-admin-template搭建

改下路由、view下新增自己的页面就可以使用了



### 滑动加载更多

```
const scroll = {
    isEnd: false,
    start(callback) {
        let timer = null
        callback && window.addEventListener('scroll', () => {
            if (timer) {
                clearTimeout(timer)
            }
            // 函数防抖
            timer = setTimeout(() => {
                // 浏览器向上滚动的高度
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
                // 文档的真实高度
                const scrollHeight = document.documentElement.scrollHeight
                // 浏览器窗口（文档）的可视高度,就是肉眼可见的那部分全屏高度
                const clientHeight = document.documentElement.clientHeight
                if (!this.isEnd && scrollHeight == scrollTop + clientHeight) {
                    window.scrollTo(0, scrollTop - 100)
                    // 请求数据
                    callback()
                }
            }, 300)
        })
    },
    end() {
        this.isEnd = true
    }
}

export default scroll


```



### api放统一文件夹中

举个例子

```
import request from '@/utils/request'
const baseUrl = 'http://localhost:3000'

export function fetchList (params) {
    return request({
        url: `${baseUrl}/blog/list`,
        method: 'get',
        params
    })
}

export function del (params) {
    return request({
        url: `${baseUrl}/blog/del`,
        method: 'post',
        data: {
            ...params
        }
    })
}
```



## 后端

### 获取token

```
const rp = require('request-promise')
const APPID = 'xx'
const APPSECRET = 'xx'
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
```



### 调用云数据库、

```
const getAccessToeken = require('../utils/getAccessToken')
const rp = require('request-promise')

const callCloudDB = async (ctx, fnName, query = {}) => {
    const access_token = await getAccessToeken()
    const url = `https://api.weixin.qq.com/tcb/${fnName}?access_token=${access_token}`

    const options = {
        method: 'POST',
        uri: url,
        body: {
            query,
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
```



### 调用云函数

```
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
```



### 调用云存储

```
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
```



### 业务逻辑

举个例子

```
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
```



### 跨域问题

```
npm i koa2-cors

const cors = require('koa2-cors')

app.use(cors({
    origin: ['http://localhost:9528'],
    credentials: true
}))
```



### post请求

```
npm i koa-body

const koaBody = require('koa-body')

app.use(koaBody({
    multipart: true
}))
```



### 中间件

```
app.use(async (ctx, next) => {
    console.log('全局中间件')
    ctx.state.env = ENV
    await next()
})
```



### 路由

```
npm i kia-router

const Router = require('koa-router')
const router = new Router()

const playlist = require('./controller/playlist')
const swiper = require('./controller/swiper')
const blog = require('./controller/blog')
router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog', blog.routes())

app.use(router.routes())
app.use(router.allowedMethods())
```

