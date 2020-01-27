// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      default: false
    },
    lyric: String
  },
  observers: {
    lyric(lrc) {
      if (lrc === '暂无歌词') {
        this.setData({
          lrcList: [
            {
              time: 0,
              lrc
            }
          ],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0,
    scrollTop: 0
  },
  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success: function(res) {
          lyricHeight = res.screenWidth / 750 * 65
        },
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      let lrcList = this.data.lrcList
      if (lrcList.length === 0) return
      const nowLyricIndex = lrcList.findIndex((item, index) => {
        return item.time >= currentTime
      })
      if (currentTime > lrcList[lrcList.length -1].time) {
        if (this.data.nowLyricIndex !== -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for (let i = 0, len = lrcList.length; i < len; i++) {
        if (lrcList[i].time >= currentTime) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      let _lrcList = []
      line.forEach(elem => {
        let time = elem.match(/\[(\d{2,}):(\d{2,})(?:\.(\d{2,3}))?]/g)
        if (time !== null) {
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2,})(?:\.(\d{2,3}))?/)
          let time2Seconds = +timeReg[1] * 60 + +timeReg[2] + +timeReg[3] / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})