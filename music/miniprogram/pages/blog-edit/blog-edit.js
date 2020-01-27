// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9

const db = wx.cloud.database()
let content = ''
let userInfo = {}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectPhoto: true,
    wordsNum: 0,
    footerBottom: 0,
    images: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    userInfo = options
  },
  onInput (event) {
    // console.log(event)
    let wordsNum = event.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  onFocus (event) {
    // console.log(event)
    this.setData({
      footerBottom: event.detail.height
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },
  onChooseImage () {
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
  },
  showAddImg() {
    this.setData({
      selectPhoto: this.data.images.length < 9
    })
  },
  onDelImage (event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    this.showAddImg()
  },
  onPreviewImage (event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  send () {
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
    })
    let promiseArr = []
    let fileIds = []
    this.data.images.forEach(item => {
      let p = new Promise((resolve, reject) => {
        let suffix = /\.\w+$/.exec(item)[0]
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
      })
      promiseArr.push(p)
    })
    Promise.all(promiseArr).then(res => {
      console.log(res)
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate()
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        wx.navigateBack()
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})