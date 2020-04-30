// pages/about/home/home.js
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    rank: 0,
    favoritesCount: 0,
    answerTotal: 0,
  },
  attached() {
    console.log("success")
    let that = this;
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
    let i = 0;
    numDH();
    function numDH() {
      if (i < 20) {
        setTimeout(function () {
          that.setData({
            rank: i,
            answerTotal: i,
            favoritesCount: i
          })
          i++
          numDH();
        }, 20)
      } else {
        that.setData({
          // rank: that.coutNum(0),
          // answerTotal: that.coutNum(0),
          // favoritesCount: that.coutNum(0)
          rank: '#',
          answerTotal: '#',
          favoritesCount: '#'
        })
      }
    }
    wx.hideLoading()
  },
  methods: {
    coutNum(e) {
      if (e > 1000 && e < 10000) {
        e = (e / 1000).toFixed(1) + 'k'
      }
      if (e > 10000) {
        e = (e / 10000).toFixed(1) + 'W'
      }
      return e
    },
    CopyLink(e) {
      wx.setClipboardData({
        data: e.currentTarget.dataset.link,
        success: res => {
          wx.showToast({
            title: '已复制',
            duration: 1000,
          })
        }
      })
    },
    showModal(e) {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    },
    hideModal(e) {
      this.setData({
        modalName: null
      })
    },
    showQrcode() {
      wx.previewImage({
        urls: ['https://www.charleschr.xyz/publicimages/payqrWechat.jpg'],
        current: 'https://www.charleschr.xyz/publicimages/payqrWechat.jpg' // 当前显示图片的http链接
      })
    },
    centerLogin(){
      wx.cloud.callFunction({
        name: 'checkBinded',
        data: {},
        success: res => {
          console.log('[云函数] [checkBinded] 调用成功：', res)
          if(!res.result.status)
          {
              wx.navigateTo({
                url: '/pages/bindUserInfo/index',
              });
          }else{
            wx.showToast({
              icon: 'none',
              title: '您已成功进行学生认证',
              mask:true
            });
          }
          
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '调用失败'
          })
          console.error('[云函数] [checkBinded] 调用失败：', err)
        }
      })
    }
  }
})