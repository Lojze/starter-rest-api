import { Router } from "express";
import Spark from '../utils/SparkNodejs/spark.js';

// Initialize Express router
export const ai = Router();

ai.post("/quaere", async (req, res) => {
    // req.body.msg;
    console.log(req.body);
    res.send(req.body.msg);
    // const spark = new Spark({
    //     // 自行填入相关参数
    //     secret: process.env.API_SECRET,
    //     key: process.env.API_KEY,
    //     appid: process.env.APPID,
    // });
    // const url = spark.chat({
    //     content: '你好',
    //     // onData 表示分段拿到返回结果
    //     onData({content, start, end, seq}){
    //         // content 表示分段的内容 
    //         // start 表示是否是第一段
    //         // end 表示是否是最后一段
    //         // seq 表示序号
    //         console.log(content, start, end, seq);
    //     },
    //     onEnd({content, token, questionTokens}){
    //         // content 表示完整的返回
    //         // token 表示返回回答的token数
    //         // questionTokens 表示发起对话的token数
    //         console.log(content, token, questionTokens);
    //     }
    // });
    // const answer = await spark.chat({content:'您好'});
    // console.log(answer);
})


