let movableAreaWidth = 0
let movableViewWidth = 0

let currentSec = -1
let duration = 0
let isMoving = false

const backgroundAudioManager = wx.getBackgroundAudioManager()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0
  },
  lifetimes: {
    ready () {
      if (this.properties.isSame && this.data.showTime.totalTime === '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      if (event.detail.source === 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd () {
      const currentTimeFmt = this._dateFormat(Math.floor(this.data.progress / 100 * duration))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      backgroundAudioManager.seek(this.data.progress / 100 * duration)
      isMoving = false
    },
    _getMovableDis () {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },
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
    _setTime () {
      duration = backgroundAudioManager.duration
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dateFormat (sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec + ''
    }
  }
})
