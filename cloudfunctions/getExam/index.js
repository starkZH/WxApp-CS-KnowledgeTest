/**
 * 获取试题。在测试开始前10分钟访问可将数据加载进缓存，减少后续用户获取的时间
 * 
 */
const cloud = require('wx-server-sdk')

cloud.init()

let examCache = {};

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  let exam_id = event.exam_id;
  let delete_mode = !(Boolean(event.exam_id));
  let result={};
  if (!delete_mode){
    //优先从缓存读取
    let exam = examCache[exam_id] ? examCache[exam_id].value : null;
    if (!exam)
      await db.collection('exam').doc(exam_id).field({ answer: false }).get().then(res => {
        let cache = false;
        let data = res.data;
        if(!data.open){
          result={errcode:1,errmsg:'问卷未开放'};
          return;
        }
        let openTime = data.openTime.getTime();
        let current = new Date().getTime();
        delete data['answer']
        exam = data;
        if (current < openTime) {
          delete exam['question'];
          result.errcode = 1;
          result.errmsg = '问卷尚未开始';
          if (openTime - current<=600)
            cache = true;
          else return;
        } else cache = true;

          if (cache)
          //放进缓存
          examCache[exam_id] = { value: exam, timestamp: new Date().getTime() };
        
        result.data = exam;
      }).catch((res) => {
        console.log(res)
        result.errcode = 1;
        result.errmsg = '问卷异常'
      })
    else result.data=exam;
  }else{
    //清理过期数据
    let currentTime = new Date().getTime();
    let expire_mill_seconds = 1800 * 1000;
    let count = 0;
    for (let key in examCache) {
      if (currentTime - examCache[key].timestamp > expire_mill_seconds) {
        delete examCache[key];
        count++;
      }
    }
    console.log(`Have clear ${count} answer(s) in cache`)
    console.log(examCache)
  }
 
  return result
}