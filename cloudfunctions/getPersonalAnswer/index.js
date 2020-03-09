/**
 * 获取个人某次测试的答题情况
 * {type,answer_id}
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
let table = { 1: "answer_formal", 2:"answer_simulation"};
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return await db.collection(table[event.type]).doc(event.answer_id).get();
  
}