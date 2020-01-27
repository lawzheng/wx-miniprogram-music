const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
const koaBody = require('koa-body')

const ENV = 'test-qi0il'

app.use(async (ctx, next) => {
    console.log('全局中间件')
    ctx.state.env = ENV
    await next()
})

app.use(koaBody({
    multipart: true
}))

app.use(cors({
    origin: ['http://localhost:9528'],
    credentials: true
}))

const playlist = require('./controller/playlist')
const swiper = require('./controller/swiper')
const blog = require('./controller/blog')
router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog', blog.routes())

app.use(router.routes())
app.use(router.allowedMethods())



app.listen(3000)