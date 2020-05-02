/**
 * 计算某次测试的排名并保存。
 * {exam_id:''}
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
let cache={count:0,data:[]};
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let exam_id = event.exam_id;
  let result={};
  //console.log(result)
  //更新用户的名次
    console.log("calculate rank");
    if (!exam_id){
      console.log('Invalid Exam id')
      return {code:1};
    }
    await db.collection('answer_formal')
      .where({
        exam_id: exam_id
      })
      .limit(1000)
      .field({
        user_id: true, score: true, time_cost: true
      })
      .orderBy('score', 'desc')
      .orderBy('time_cost', 'asc')
      .get().then((res) => {
        let data = res.data;
        let last = '';
        let rank = 0;
        for (let val of data) {
          let key = val.score + '-' + val.time_cost;
          val.rank = key != last ? (++rank) : rank;
          last = key;
        }
        result.data = data;
    })
  //更新总参数人数
  await db.collection('exam').doc(exam_id).update({
    data: {
      total_people: result.data.length,
      rank: result.data
    }
  });
  return result
}