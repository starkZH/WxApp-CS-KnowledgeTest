/**
 * {collection_id}
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try {
  return await db.collection('wrong_collection').doc(event.collection_id).remove({
    })
  } catch (e) {
    console.error(e)
    return {errcode:1}
  }
}