Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    playlist: {
      type: Object
    }
  },
  observers: {
    ['playlist.playCount'](count) {
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },
  data: {
    // 这里是一些组件内部数据
    _count: ''
  },
  methods: {
    goToMusiclist () {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    },
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
  }
})