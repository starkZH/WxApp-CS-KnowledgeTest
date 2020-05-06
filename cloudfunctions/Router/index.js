/**
 * 后台管理总路由
 */
/**
 * login:登录接口 {username,password}
 * updateExamOpenStatus:开放、关闭测试 {exam_id,open_status}
 * getRank:获取排行榜 {exam_id}
 * getExamList:获取测试列表 {page,limit}
 * addExam:添加测试{}
 * updateExam:更新测试{id,data}
 * deleteExam:删除测试{id}
 */
const Token = require('./Token.js') 
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database();
const _ = db.command;
const Result = ResultModel();
let tokenCache = {timestamp:0,value:''};

const routes = { login, logout, updateExamOpenStatus, getRank, getExamList, addExam, updateExam, deleteExam, getExam, getBaseInfo, 
getBaseSettings, deleteBaseSetting, updateBaseSetting, addBaseSetting,
getTempFileUrl};


async function login(params){
  let result = {};
  let userInfo = {
    username: params.username,
    password: params.password
  };
  await db.collection('admin_user').where(userInfo).limit(1).get().then((res) => {
    if (res.data.length > 0) {
      let token = Token.encrypt(userInfo, '1d')
      result = Result.put({ token });
    } else result = Result.error('用户名或密码错误')
  }).catch((res) => {
    console.log(res)
    result = Result.error('登录失败')
  })
  return result;
}

function logout(){
  tokenCache = { };
  return Result.success();
}

async function getTempFileUrl({data}){
  let result = {};
  await cloud.getTempFileURL({
    fileList: data
  }).then(res=>{
    result = Result.put(res.fileList)
  })
  return result;
}

/**
 * 获取后台基本信息
 */
async function getBaseInfo(){
  let result = {};
  let data ={};
  await db.collection('exam').count().then(res=>{
    data.exam_num = res.total;
  })
  await db.collection('sys_user').count().then(res => {
    data.total_user = res.total;
  })
  await db.collection('answer_formal').count().then(res => {
    data.formal_answer_num = res.total;
  })
  await db.collection('answer_simulation').count().then(res => {
    data.simulation_answer_num = res.total;
  })
  result = Result.put(data)

  return result;
}

async function getBaseSettings() {
  let result = {};
  await cloud.callFunction({
    name:'getHomeSettings'
  }).then(res=>{
    result = Result.put(res.result);
  })
  return result;
}

async function deleteBaseSetting({id}){
  await db.collection('base_setting').doc(id).remove();
  return {code:0}
}

async function updateBaseSetting({ id, data }) {
  let result = {};
  await db.collection('base_setting').doc(id).update({data}).then(res=>{
    result = Result.put(res.stats);
  });
  return result;
}

async function addBaseSetting({ data }) {
  await db.collection('base_setting').add({ data });
  return { code: 0 }
}

async function getExam({ exam_id}){
  let result = {};
  await db.collection('exam').doc(exam_id).get().then(res => {
    result = Result.put(res.data);
  }).catch(res => {
    result = Result.error(res);
  })
  try {
    await cloud.getTempFileURL({
      fileList: [result.data.img_id]
    }).then(res => {
      result.data.img_url = res.fileList[0];
    })
  }catch(e){}
  return result;
}

async function updateExamOpenStatus({exam_id,open_status}){
  let result={};
  await db.collection('exam').doc(exam_id).update({
    data:{open:open_status}
  }).then(res=>{
    result = Result.put(res);
  }).catch(res=>{
    result = Result.error(res);
  })
  return result;
}

async function addExam(exam){
  let result = {};
  exam.openTime = new Date(exam.openTime)
  exam.createTime = new Date(exam.createTime)
  exam.endTime = new Date(exam.endTime)
  await db.collection('exam').add({
    data:exam
  }).then(res => {
    result = Result.put(res);
  }).catch(res => {
    result = Result.error(res);
  })
  return result;
}

async function updateExam({id,data}){
  let result = {};
  data.openTime = new Date(data.openTime)
  data.endTime = new Date(data.endTime)
  await db.collection('exam').doc(id).update({ data}).then(res => {
    result = Result.put(res);
  }).catch(res => {
    result = Result.error(res);
  })
  return result;
}

async function deleteExam({ id }) {
  let result = {};
  await db.collection('exam').doc(id).remove().then(res => {
    result = Result.put(res);
  }).catch(res => {
    result = Result.error(res);
  })
  return result;
}

async function getRank(data) {
  let result = {};
  const res = await cloud.callFunction({
    name:'getRank',
    data:data
  })
  result = Result.put(res.result);
  result.count = result.data.count
  return result; 
}

async function getExamList({page,limit}){
  page = Number(page);
  limit = Number(limit);
  if(isNaN(limit))
    limit = 10;
  if(isNaN(page))
    page = 1;
  let result = {};
  await db.collection('exam').orderBy('openTime','desc').skip((page-1)*limit).limit(limit).get().then((res)=>{
    result = Result.put(res.data);
  }).catch(res=>{
    result = Result.error(res);
  })
  await db.collection('exam').count().then(res=>{
    result.count=res.total;
  });
  return result; 
}

async function service(funcName,params){
  console.log(funcName,params,tokenCache)
  if(funcName!='login'){
    let res = Token.decrypt(params.authorization);
    if (!res.valid){
      return Result.error('token无效或已过期，请重新登录');
    }
  } else {
    delete params["authorization"];
    return await login(params);
  }
  delete params["authorization"];
  return await routes[funcName](params);
}

//定义返回结果实体
function ResultModel(){
  const mapper={put,error,success};
  function put(data){
    return {data:data,code:0};
  }
  function error(errmsg) {
    return { errmsg: errmsg, code: 1 };
  }
  function success() {
    return { code: 1 };
  }
  return new Proxy({}, {
    get(target, propKey, receiver) {
      return mapper[propKey];
    },
  });
}

// 云函数入口函数
exports.main = async (event, context) => {
  let funcName = event.funcName;
  let params = event.params;
  let result = typeof routes[funcName] == 'function' ? await service(funcName, params) : Result.error('Invalid Function');
  return result;
}