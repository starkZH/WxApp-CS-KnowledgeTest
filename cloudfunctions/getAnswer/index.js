/**
 * 在考试结束后可获取答案，进行校对或...
 * get_question:true表示获取题目，false则只返回答案
 */
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  let exam_id = event.exam_id;
  let res = {};
  let field = { answer: true }
  if (Boolean(event.get_question))
  field.question = true;
  await db.collection('exam').doc(exam_id).field(field)
  .get().then(data => {
    res.data=data.data;
    if(res.type==1&&new Date().getTime()< res.endTime.getTime()){
      res={errmsg:'考试未结束',errcode:1};
    }
  }).catch((res) => {
    res.errcode = 1;
    res.errmsg = '答案读取失败:'+res
  })
  return res
}