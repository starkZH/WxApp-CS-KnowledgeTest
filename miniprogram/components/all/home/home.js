// pages/all/home/home.js
var util = require('../../../utils/utils');
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    cardCur: 0,
    swiperList: [],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    scrollLeft:0,
    nav_list:['在线','模拟'],
    TabCur: 1,
    exam_list:[]

  },
  attached: function() {
    // 在组件实例进入页面节点树时执行
    // 调用函数时，传入new Date()参数，返回值是日期和时间
    // console.log('组件')
    var that = this;
    if (app.globalData.userInfo)
    {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
        this.data.userInfo = app.globalData.userInfo
        this.hasUserInfo=true
    }
      //将计时器赋值给setInter
    that.data.setInter = setInterval(() => {
          // console.log(123)
          if (app.globalData.userInfo)
          {
            this.setData({
              userInfo: app.globalData.userInfo,
              hasUserInfo: true
            })
            this.data.userInfo = app.globalData.userInfo
            this.hasUserInfo=true
          }
          that.endSetInter();
      }
    , 1500);
    var time = util.formatDate(new Date());
    // 再通过setData更改Page()里面的data，动态更新页面的数据
    this.setData({
      month: time.substr(0,2),
      day: time.substr(3,2)
    });
    wx.cloud.callFunction({
        name: 'getHomeSettings',
        data: {},
        success: res => {
          console.log('[云函数] [getHomeSettings] 调用成功：', res)
          let setting = res.result.data;
          setting.map((item,key)=>{
            item.id = key;
            item.type = 'image';
          });
          this.data.swiperList = setting;
          this.setData({
            swiperList : this.data.swiperList
          });
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '调用失败',
          })
          console.error('[云函数] [getHomeSettings] 调用失败：', err)
        }
      })
    this.getExam();

  },
  detached: function() {
    // 在组件实例被从页面节点树移除时执行
  },

  /**
   * 组件的方法列表
   */
  methods: {
    swiperClick(e)
    {
      console.log(e)
      let link = e.currentTarget.dataset.link;
      let type = link.substr(0,4);
      console.log(type);
      if(type == 'http')
      {
        wx.navigateTo({
          url: '/pages/webview/index?link='+link,
        })
      }
      if(type == 'exam')
      {
        let exam_id = link.split('//')[1];
        wx.navigateTo({
          url: '/pages/exam/index?exam_id='+exam_id,
        })
      }
    },
    cardSwiper(e) {
      this.setData({
        cardCur: e.detail.current
      })
    },
    getExam:function()
    {
      var that = this;
      wx.cloud.callFunction({
        name: 'getExamList',
        data: {
          // type:type
        },
        success: res => {
          console.log('[云函数] [getExam] 调用成功：', res)
          that.data.exam_list = res.result.data;
          that.data.exam_list.map((item,key)=>{
            // console.log(new Date(item.openTime).toLocaleString())
            // console.log(new Date(item.endTime).toLocaleString())
            if(new Date(item.endTime).getTime()<=new Date().getTime()){
              item.status = 3;
            }else if(new Date(item.openTime).getTime()>new Date().getTime()){
              item.status = 1;
            }else{
              item.status = 2;
            }
            item.openTime = new Date(item.openTime).toLocaleString()
            item.endTime = new Date(item.endTime).toLocaleString()
          });
          that.setData({
            exam_list : that.data.exam_list
          });
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
    endSetInter: function(){
      var that = this;
      //清除计时器  即清除setInter
      clearInterval(that.data.setInter)
    },
    tabSelect(e) {
      // this.getExam(e.currentTarget.dataset.id);
      this.setData({
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id-1)*60
      })
    },
    getUserInfo: function (e) {
      console.log(e)
      if (e.detail.userInfo) {
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
          userInfo: e.detail.userInfo,
          hasUserInfo: true
        })
      } else {
        this.setData({
          modalName: 'fail'
        })
      }
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

  }
})
