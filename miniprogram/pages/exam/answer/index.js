// miniprogram/pages/exam/answer/index.js
// import Dialog from '../../..//miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp()
var util = require('../../../utils/utils.js');
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
    radio: '',
    exam_id:"",
    time_cost:1800,
    gridCol:3,
  },
  savePersonalQuestion()
  {
    // console.log(this.data.exam_id);
    // console.log(this.data.question[this.data.question_index].id);
    var that = this;
    wx.showLoading({
      title: '收藏中',
    })
    wx.cloud.callFunction({
      name: 'savePersonalQuestion',
      data: {
         exam_id:this.data.exam_id,
         question_id:this.data.question[this.data.question_index].id
      },
      success: res => {
        wx.hideLoading()
        if(res.result.errcode==1)
        {
          wx.showToast({
            title: '请勿重复收藏',
            icon:'none'
          })
        }else{
          wx.showToast({
            title: '收藏成功'
          })
        }

      },
      fail: err => {
         wx.showToast({
          icon: 'none',
         title: '失败',
        })
        console.error('网络异常：', err)
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
  tabSelect(e) {
    console.log(e);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  showAnswer()
  {
    var that = this;
    console.log(this.data.exam_id)
    // wx.showLoading({
    //   title: '稍等',
    // })
    wx.cloud.callFunction({
      name: 'getAnswer',
      data: {
         exam_id:that.data.exam_id,
      },
      success: res => {
        // wx.hideLoading()
        if(res.result)
        {
          that.data.provide_answer = res.result.data.answer;//res.result.answer;
          that.setData({
            provide_answer:that.data.provide_answer,
          });
        }
      },
      fail: err => {
         wx.showToast({
          icon: 'none',
          title: '失败',
        })
        console.error('网络异常：', err)
       }
    })
    this.setData({
      showAnswer:true
    });
    
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
    var arr = event.detail;
    if(typeof arr == "object")
    {
      arr.sort(function (n,m){
        if(n<m) return -1;
        else if(n>m) return 1;
        else return 0;
      });
    }
    this.data.answer[this.data.question_index].value = arr;//event.detail;
    this.setData({
      radio: arr,//event.detail,
      answer:this.data.answer
    });
  },
  timeUp() {
    // wx.showToast({
    //   title: 'End',
    //   icon:'none',
    //   duration: 2000,
    //   mask: true
    // });
    var that = this;
    const countDown = this.selectComponent('#count_down');
    countDown.pause();
    this.data.time_cost = (this.data.time - countDown.remain)/1000;
    this.setData({
      time_cost:this.data.time_cost
    });
    wx.showLoading({title: '交卷中', icon: 'loading', duration: 10000});
    var answer_list = this.getAnswerToString();
    wx.cloud.callFunction({
      name: 'submitExam',
      data: {
         exam_id:that.data.exam_id,
         time_cost:that.data.time_cost,
         answer:answer_list//that.data.answer
      },
      success: res => {
        wx.hideLoading()
         wx.showToast({
           title: '交卷成功'
        })
        that.showAnswer()
      },
      fail: err => {
        wx.hideLoading()
         wx.showToast({
          icon: 'none',
         title: '失败',
        })
        console.error('交卷网络异常：', err)
       }
    })
  },
  getAnswerToString()
  {
    let stringAnswer = [];
    this.data.answer.map((item)=>{
      if(item.value&&typeof item.value=='object')
      {
        stringAnswer.push({value:item.value.join(',')});
      }else{
        if(!item.value)
        {
          stringAnswer.push({value:""});
        }else{
          stringAnswer.push({value:item.value});
        }
      }
    });
    // console.log(stringAnswer);
    return stringAnswer;
  },
  submitAnswer()
  {
    var that = this;
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
    var answer_list = this.getAnswerToString();
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
              answer:answer_list,//that.data.answer
            },
            success: res => {
              wx.hideLoading()
              if(res.result.errcode==1)
              {
                setTimeout(()=>{
                  wx.showToast({
                    title: '系统已截止,提交失败',
                    icon:'none',
                    duration:3000
                  })
                },1200)
                // wx.hideLoading()
              }else{
                setTimeout(()=>{
                  wx.showToast({
                    title: '提交成功'
                  })
                  that.toResultPage();
                },1200)
              }
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
  toResultPage()
  {
    wx.navigateTo({
      url: '/pages/exam/result/index?exam_id='+this.data.exam_id,
    });

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
          let now_time = new Date().getTime();
          let end_time = new Date(this.data.exam_data.endTime).getTime();
          // if(end_time-now_time<1800000&&end_time-now_time>0)
          if(end_time-now_time>0)
          {
            this.data.time = end_time-now_time;
            this.setData({
              time:this.data.time
            });
          }else{
            this.data.time = 0 * 60 * 1000;
            this.setData({
              time:this.data.time
            });
          }
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
    this.timeUp();
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