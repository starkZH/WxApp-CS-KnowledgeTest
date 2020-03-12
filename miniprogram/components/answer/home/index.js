// components/answer/home/index.js
var util = require('../../../utils/utils');
const app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    nav_list:['在线','模拟'],
    TabCur: 1,
    answerList:{},
    userInfo:app.globalData.userInfo

  },
  attached: function() {
    wx.cloud.callFunction({
      name: 'getPersonalAnswerList',
      data: {type:1},
      success: res => {
        console.log('[云函数] [getPersonalAnswerList] 调用成功：', res)
        this.data.answerList = res.result.data;
        this.setData({
          answerList : this.data.answerList
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [getPersonalAnswerList] 调用失败：', err)
      }
    })

  },

  /**
   * 组件的方法列表
   */
  methods: {
    tabSelect(e) {
      // this.getExam(e.currentTarget.dataset.id);
      wx.cloud.callFunction({
        name: 'getPersonalAnswerList',
        data: {type:e.currentTarget.dataset.id},
        success: res => {
          console.log('[云函数] [getPersonalAnswerList] 调用成功：', res)
          this.data.answerList = res.result.data;
          this.setData({
            answerList : this.data.answerList
          });
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '调用失败',
          })
          console.error('[云函数] [getPersonalAnswerList] 调用失败：', err)
        }
      })
      this.setData({
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id-1)*60
      })
    },
  }
})
