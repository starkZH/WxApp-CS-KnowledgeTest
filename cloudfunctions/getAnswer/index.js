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
  await db.collection('exam').field(field)
  .where({
    _id:_.eq(exam_id),
    endTime:_.lt(new Date())
  })
  .limit(1)
  .get().then(data => {
    res=data.data[0];
  }).catch((res) => {
    res.errcode = 1;
    res.errmsg = '答案读取失败:'+res
  })
  return res
}