/**
 * 获取题目收藏夹
 * { page:1 }
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let skip = (Number(event.page)-1)*10;
  if(isNaN(skip)||skip<0)skip = 0;
  let result = {},arr=[];
  let cols=[];
  await db.collection('wrong_collection')
    .where({
      user_id: wxContext.OPENID
    })
    .skip(skip)
    .limit(10)
    .get().then((res)=>{
      cols = res.data;
    });

  for (let val of cols) {
    let item = {id:val._id};
    let question_id = val.question_id;
    //获取题目
    await db.collection('exam').where({
      _id: val.exam_id,
      "question.id": question_id
    })
      .field({
        "question.$": true
      }).get().then((res) => {
        item.question = res.data[0].question[0]
      });

    //获取答案
    await db.collection('exam').where({
      _id: val.exam_id,
      "answer.id": question_id
    })
      .field({
        "answer.$": true
      }).get().then((res) => {
        item.answer = res.data[0].answer[0];
      })
    arr.push(item);
  }
  result.data=arr;

  return result
}