// components/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
  pageLifetimes: {
    show() {
      this.setData({
        playingId: +app.getPlayMusicId()
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {
      const musicId = event.currentTarget.dataset.musicid
      const index = event.currentTarget.dataset.index
      // app.setPlayMusicId(musicId)
      this.setData({
        playingId: musicId
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicId}&index=${index}`,
      })
    }
  }
})
