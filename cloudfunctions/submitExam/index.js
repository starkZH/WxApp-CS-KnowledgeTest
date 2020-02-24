/***
 * 提交正式答卷，返回评分score
*/

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
let ANSWER_TYPE={1:'answer_formal',2:'answer_simulation'}
//答案缓存，用来减少查数据库次数
let answerCache={};
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  let result={};
  const wxContext = cloud.getWXContext();
  //判断模式，若为删除模式，则清理过期的答案
  let delete_mode = !(Boolean(event.exam_id));
  if (!delete_mode) {
    let data = {
      user_id: wxContext.OPENID,
      answer: event.answer,
      exam_id: event.exam_id,
      time_cost: event.time_cost
    }
    let exam_id = data.exam_id;
    let standard = answerCache[exam_id] ? answerCache[exam_id].value : null;
    let score = 0;
    let exam_type = 1;
    //获取标准答案
    if (!standard) {
      await db.collection('exam').doc(exam_id).field({ answer: true ,type:true }).get().then((res) => {
        standard = res.data.answer;
        exam_type = res.data.type;
        if(standard)
        answerCache[exam_id] = { value: standard, timestamp: new Date().getTime() };
      })
    }
    
    if(!standard) return {errcode:1,errmsg:'Invalid ExamID'}

    for (let i in standard) {
      data.answer[i] = typeof data.answer[i] == 'Object' ? data.answer[i] : { value: data.answer[i] };
      data.answer[i].id = standard[i].id;
      //判断答案
      if (standard[i].value == data.answer[i].value) {
        score += Number(standard[i].score);
        //答案正确
        data.answer[i].result = 1;
      } else
        data.answer[i].result = 0;
    }
    data.score = score;
    data.create_time = new Date();
    await db.collection(ANSWER_TYPE[exam_type]).add({data}).then(res => {
      result.score = score;
    }).catch(res => {
      result.errcode = 1;
      result.errmsg = res;
    })

}else{
  //清除过期答案
  let currentTime = new Date().getTime();
  let expire_mill_seconds = 3600 * 1000;
  let count = 0;
  for(let key in answerCache){
    if ( currentTime - answerCache[key].timestamp  > expire_mill_seconds){
      delete answerCache[key];
      count++;
    }
  }
  console.log(`Have clear ${count} answer(s) in cache`)
  console.log(answerCache)
}

  return result;
}