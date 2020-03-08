// miniprogram/pages/exam/answer/index.js
// import Dialog from '../../..//miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAnswer:false,
    provide_answer:[],
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 1,
    scrollLeft: 0,
    time: 30 * 60 * 1000,
    exam_data:[],
    answer:[],
    question_index:0,
    question_total:0,
    exam_id:"",
    time_cost:1800,
    radio: '',
    gridCol:3,
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
  tabSelect(e) {
    console.log(e);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  showAnswer()
  {
    wx.showLoading({
      title: '稍等',
    })
    wx.cloud.callFunction({
      name: 'getAnswer',
      data: {
         exam_id:this.data.exam_id,
      },
      success: res => {
        wx.hideLoading()
        this.data.provide_answer = res.result.answer;
        this.setData({
          provide_answer:this.data.provide_answer,
          showAnswer:true
        });
      },
      fail: err => {
         wx.showToast({
          icon: 'none',
         title: '失败',
        })
        console.error('交卷网络异常：', err)
       }
    })
    
  },

  changeQuestion(e)
  {
    console.log(e.currentTarget.dataset.index);
    let index = e.currentTarget.dataset.index;
    this.data.radio = this.data.answer[index].value;
    this.data.question_index = index;
    this.setData({
      question_index:this.data.question_index,
      radio:this.data.radio
    });

  },
  radioChange(event) {
    this.data.answer[this.data.question_index].value = event.detail;
    this.setData({
      radio: event.detail,
      answer:this.data.answer
    });
  },
  timeUp(e) {
    wx.showToast({
      title: 'End',
      icon:'none',
      duration: 2000,
      mask: true
    });
    const countDown = this.selectComponent('#count_down');
    countDown.pause();
    this.data.time_cost = (this.data.time - countDown.remain)/1000;
    this.setData({
      time_cost:this.data.time_cost
    });
    wx.showLoading({title: '加载中', icon: 'loading', duration: 10000});
    wx.cloud.callFunction({
      name: 'submitExam',
      data: {
         exam_id:this.data.exam_id,
         time_cost:this.data.time_cost,
         answer:this.data.answer
      },
      success: res => {
         wx.showToast({
           title: '交卷成功'
        })
        wx.hideLoading()
        this.showAnswer()
      },
      fail: err => {
         wx.showToast({
          icon: 'none',
         title: '失败',
        })
        console.error('交卷网络异常：', err)
       }
    })
  },
  submitAnswer()
  {
    const that = this;
    console.log('submit answer')
    let count = this.checkAnswerNotNull();
    if(count>0)
    {
      wx.showToast({
        title: '还有'+count+'题没有做',
        icon:'none',
        duration: 2000,
        mask: true
      });
    }
    wx.showModal({
      title: '提示',
      content: '确认交卷',
      success (res) {
        if (res.confirm) {
          console.log('确定交卷')
          const countDown = that.selectComponent('#count_down');
          countDown.pause();
          that.data.time_cost = (that.data.time - countDown.remain)/1000;
          that.setData({
            time_cost:that.data.time_cost
          });
          wx.showLoading({title: '加载中', icon: 'loading', duration: 10000});
          wx.cloud.callFunction({
            name: 'submitExam',
            data: {
              exam_id:that.data.exam_id,
              time_cost:that.data.time_cost,
              answer:that.data.answer
            },
            success: res => {
              wx.showToast({
                title: '提交成功'
              })
              wx.hideLoading()
              that.showAnswer()
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '失败',
              })
              console.error('交卷网络异常：', err)
            }
          })
        } else if (res.cancel) {
          console.log('用户取消交卷');
        }
      }
    });
    
  },
  checkAnswerNotNull()
  {
    let count = 0;
    for(let i = 0;i<(this.data.answer.length);i++)
    {
      if(this.data.answer[i].value==null)
      {
        count++;
      }
    }
    if(count>0)
    {
      return count;
    }
    return 0;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.animate('#container', [
    //   { opacity: 0.0},
    //   { opacity: 1.0},
    // ], 2000)
    // console.log(options.exam_id);
    this.data.exam_id = options.exam_id;
    this.setData({
      exam_id:this.data.exam_id
    });
    if(!this.data.exam_id)
    {
      wx.navigateTo({
        url: '/pages/index/index',
      })
    }
    wx.showLoading({title: '加载中', icon: 'loading', duration: 10000});
    wx.cloud.callFunction({
        name: 'getExam',
        data: {
          exam_id:this.data.exam_id
        },
        success: res => {
          this.data.exam_data = res.result.data;
          this.data.question_total = res.result.data.question.length;
          this.data.exam_data.question.map((item)=>{
            this.data.answer.push({value:null});
          });
          this.setData({
            exam_data:this.data.exam_data,
            question_total:this.data.question_total,
            question:this.data.exam_data.question,
            showButton:true
          });
          wx.hideLoading()
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