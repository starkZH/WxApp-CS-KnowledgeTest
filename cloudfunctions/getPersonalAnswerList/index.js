/**
 * 获取个人的答题记录列表
 * {type}
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
let table = { 1: "answer_formal", 2: "answer_simulation" };
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let result = {},arr=[];
  await db.collection(table[event.type]).field({answer:false}).where({ user_id: _.eq(wxContext.OPENID)}).get().then((res)=>{
    arr = res.data
  })

  result.data = arr;

  return result;
}