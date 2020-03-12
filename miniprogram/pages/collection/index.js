// miniprogram/pages/collection/index.js
var util = require('../../utils/utils.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'getCollection',
      data: {
        page:1
      },
      success: res => {
        console.log('[云函数] [getCollection] 调用成功：', res)
        this.data.collection_list = res.result.data
        this.setData({
          collection_list:this.data.collection_list
        });
        // let setting = res.result.data;
        // setting.map((item,key)=>{
        //   item.id = key;
        //   item.type = 'image';
        // });
        // this.data.swiperList = setting;
        // this.setData({
        //   swiperList : this.data.swiperList
        // });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [getExam] 调用失败：', err)
      }
    })

  },
  getDetail(e)
  {
    var that = this;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/collection/detail/index',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', that.data.collection_list[index])
      }
    })
  },
  removeCollection(e)
  {
    // console.log(e.currentTarget.dataset.id)
    wx.cloud.callFunction({
      name: 'deleteCollection',
      data: {
        collection_id:e.currentTarget.dataset.id
      },
      success: res => {
        console.log('[云函数] [deleteCollection] 调用成功：', res)
        wx.showToast({
          icon: 'none',
          title: '操作成功'
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败'
        })
        console.error('[云函数] [deleteCollection] 调用失败：', err)
      },
      complete:res=>{
        wx.startPullDownRefresh();
      }
    })
  },
  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection =='left'){
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
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
    wx.cloud.callFunction({
      name: 'getCollection',
      data: {
        page:1
      },
      success: res => {
        console.log('[云函数] [getCollection] 调用成功：', res)
        this.data.collection_list = res.result.data
        this.setData({
          collection_list:this.data.collection_list
        });
        // let setting = res.result.data;
        // setting.map((item,key)=>{
        //   item.id = key;
        //   item.type = 'image';
        // });
        // this.data.swiperList = setting;
        // this.setData({
        //   swiperList : this.data.swiperList
        // });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [getExam] 调用失败：', err)
      }
    })
    wx.stopPullDownRefresh();

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