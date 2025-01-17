import { Router } from "express";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import Spark from '../utils/SparkNodejs/spark.js';
import { promptsList } from '../utils/SparkNodejs/prompts.js';
import { authenticateUser,generateAccessToken } from "../utils/auth.js";
import cron from'node-cron';
import fetch from 'node-fetch';
import CyclicDB from "@cyclic.sh/dynamodb";
const db = CyclicDB(process.env.CYCLIC_DB);
const aiIdeasCollection = db.collection("aiIdeas");

import {getRandomList,getTopByLike,getNewlyAddedIdeas,isYesterday,isToday,getWeekNumber} from "../utils/publicTool.js";

export const ai = Router();

//  创建一个新的想法
ai.post("/quaere", async (req, res) => {
    try {
        const prompts = promptsList[Math.floor(Math.random() * promptsList.length)]
        const spark = new Spark({
            // 自行填入相关参数
            secret: process.env.API_SECRET,
            key: process.env.API_KEY,
            appid: process.env.APPID,
            chatId:"5f9b3b3b4b5b4a0001b2b2b2",
            uid:"5f9b3b3b4b5b4a0001b2b2b2",
        });
        let answer = await spark.chat({content:`请帮我创造${prompts},请直接回复我，内容在200字内,之前回答重复的请重新回答`});
        console.log(answer)
        if (answer) {
            // 添加数据
            const id = uuidv4();
            const titleHandle = answer;
        
            // 生成数据
            const aiIdeas = {
                id,
                title: titleHandle,
                typeTitle:prompts,
                like:0
            };
            await aiIdeasCollection.set(id, aiIdeas);
        
            // 返回数据
            const { results } = await aiIdeasCollection.list();
            res.send(results);
        } else {
            res.send("没有生成想法");
        }
    
    } catch (e) {
        console.log(e.message, `自动生成想法失败`);
        res.sendStatus(201);
    }
})

// 查询所有数据
ai.get("/all",async (req, res) => {
    try {
        const { results:bikesMetadata } = await aiIdeasCollection.list();
        const bikes = await Promise.all(
            bikesMetadata.map(async ({ key }) => (await aiIdeasCollection.get(key)).props)
        );
        res.send({
            ...processData(bikes),
            total:bikesMetadata.length
        });
    } catch (e) {
        console.log(e.message, `查询所有数据失败`);
        res.sendStatus(201);
    }
});

// 过滤返回的数据
const processData = (arr) => {
    // 当前服务时间
    const currentDate = new Date();
    // 随机取20个
    const randomList = getRandomList(arr, 20);
    
    // 本月热门，按like数从大到小取前20
    const currentMonthHotList = getTopByLike(arr.filter(item => new Date(item.created).getMonth() === currentDate.getMonth()), 20);
    
    // 本周热门，按like数从大到小取前20
    const currentWeekHotList = getTopByLike(arr.filter(item => getWeekNumber(new Date(item.created)) === getWeekNumber(currentDate)), 20);
    
    // 昨天热门，按like数从大到小取前10
    const yesterdayHotList = getTopByLike(arr.filter(item => isYesterday(new Date(item.created))), 10);

    // 今天热门，按like数从大到小取全部
    const todayHotList = getTopByLike(arr.filter(item => isToday(new Date(item.created))), arr.length);
    
    // 新想法刚刚出现，按时间排序
    const newlyAddedList = getNewlyAddedIdeas(arr);
    
    // 历史上最热门，按like数从大到小取前40
    const allTimeHotList = getTopByLike(arr, 40);
    
    return {
        randomList, // 随机
        currentMonthHotList,// 本月
        yesterdayHotList, // 昨天
        todayHotList, // 今天
        newlyAddedList, // 新想法
        currentWeekHotList, // 本周
        allTimeHotList // 历史
    };
}

// 喜欢或者不喜欢
ai.post("/like", async (req, res) => {
    const { key, like } = req.body;
    try {
        const { props: bike } = await aiIdeasCollection.get(key);
        const newData = { like: like ? bike.like + 1 : bike.like - 1};
        const { props: newBike } = await aiIdeasCollection.set(key, newData);
        res.send({
            like: newBike.like,
            id:key
        });
    } catch (e) {
        console.log(e.message, `like失败`);
        res.sendStatus(201);
    }
});

// 删除数据
ai.post("/delete", async (req, res) => {
    const { key } = req.body;
    try {
        await aiIdeasCollection.delete(key);
        res.sendStatus(200);
    } catch (e) {
        console.log(e.message, `删除数据失败`);
        res.sendStatus(201);
    }
})


cron.schedule('0 * * * *', async() => {
    try {
        const prompts = promptsList[Math.floor(Math.random() * promptsList.length)]
        const spark = new Spark({
            // 自行填入相关参数
            secret: process.env.API_SECRET,
            key: process.env.API_KEY,
            appid: process.env.APPID,
            chatId:"5f9b3b3b4b5b4a0001b2b2b2",
            uid:"5f9b3b3b4b5b4a0001b2b2b2",
        });
        let answer = await spark.chat({content:`请帮我创造${prompts},请直接回复我，内容在200字内,之前回答重复的请重新回答`});
        console.log(answer)
        if (answer) {
            // 添加数据
            const id = uuidv4();
            const titleHandle = answer;
        
            // 生成数据
            const aiIdeas = {
                id,
                title: titleHandle,
                typeTitle:prompts,
                like:0
            };
            await aiIdeasCollection.set(id, aiIdeas);
        }
    
    } catch (error) {
        console.log(error);
    }
});

