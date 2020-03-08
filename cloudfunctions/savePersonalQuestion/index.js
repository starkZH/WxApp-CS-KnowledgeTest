/**
 * {exam_id,question_id}
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let data = { user_id: wxContext.OPENID, exam_id: event.exam_id,question_id:event.question_id};
  let result = {};
  await db.collection('wrong_collection').add({
    data
  }).catch(res=>{
    result.errcode=1;
    result.errmsg = res;
  })

  return result;
}