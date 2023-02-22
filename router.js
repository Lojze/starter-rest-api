import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { Record, String, Number, Boolean } from "runtypes";

import { authenticateUser } from "./auth.js";

import { Router } from "express";
import CyclicDB from "@cyclic.sh/dynamodb";

// Initialize Express router
export const router = Router();

// Initialize AWS CyclicDB
const db = CyclicDB(process.env.CYCLIC_DB);
const bikesCollection = db.collection("bikes");

// ------------------------------------
// GET ROUTES
// ------------------------------------

// Get all bikes/比较慢
router.get("/all", authenticateUser, async (req, res) => {
  const { results: bikesMetadata } = await bikesCollection.list();

  const bikes = await Promise.all(
    bikesMetadata.map(async ({ key }) => (await bikesCollection.get(key)).props)
  );

  res.send(bikes);
});

// Get bike by ID
router.get("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;

  try {
    const { props: bike } = await bikesCollection.get(id);
    res.send(bike);
  } catch (e) {
    console.log(e.message, `Item with ID ${id} does not exist.`);
    res.sendStatus(404);
  }
});

// Get bike by handle 查询名称/比较慢
router.get("/by-handle/:handle", authenticateUser, async (req, res) => {
  const handle = req.params.handle;

  try {
    const { results } = await bikesCollection.filter({ handle });
    if (!results.length) throw new Error();

    const { props: bike } = results[0];
    res.send(bike);
  } catch (e) {
    console.log(`GET /bikes/by-handle/${handle}`, e.message);
    res.sendStatus(404);
  }
});

// Search bikes by title/ 搜索：支持模糊搜索search/by-title?query=xx
router.get("/search/by-title", authenticateUser, async (req, res) => {
  const query = req.query.query || "";

  try {
    const { results } = await bikesCollection.parallel_scan({
      expression: "contains(#title, :title)",
      attr_names: {
        "#title": "title",
      },
      attr_vals: {
        ":title": query,
      },
    });

    const bikes = results.map(({ props }) => props);
    res.send(bikes);
  } catch (e) {
    console.log(`GET /bikes/search/by-title term="${query}"`, e.message);
    res.sendStatus(400);
  }
});

// ------------------------------------
// POST ROUTES
// ------------------------------------


// Type for new bikes 定义接口
const Money = Record({
  amount: Number,
  currencyCode: String,
});
const PriceRange = Record({
  minPrice: Money,
  maxPrice: Money,
});
const BikeData = Record({
  title: String,
  productType: String,
  createdAt: String,
  description: String,
  vendor: String,
  availableForSale: Boolean,
  totalInventory: Number,
  priceRange: PriceRange,
});


// Create new bike / 上传一段json
router.post("/", authenticateUser, async (req, res) => {
    const bikeData = req.body;

    try {
        // Make sure bike data exists
        if (!req.body) {
            throw new Error();
        }

        // Make sure bike data contains all required fields / 校验
        const bikeObject = BikeData.check(bikeData);

        const bikeId = uuidv4();
        const bikeHandle = slugify(bikeObject.title).toLowerCase();

        // Create full bike object
        const bike = { ...bikeObject, id: bikeId, handle: bikeHandle };
        // Save bike object
        await bikesCollection.set(bikeId, bike);

        // add db 成功
        res.send(bike);
    } catch (e) {
        // 增加失败
        console.log(`POST /bikes/`, e.message);
        res.sendStatus(400);
    }
});

// ------------------------------------
// PUT ROUTES
// ------------------------------------

// 根据id 修改 /两种方式一种删除，在添加/直接覆盖
// put 替换整个 数据
// Update entire bike
router.put("/:id", authenticateUser, async (req, res) => {
    const bikeId = req.params.id;
    const bikeData = req.body;

    try {
        // Make sure bike data exists
        if (!req.body) {
            throw new Error();
        }

        // Make sure bike has ID and handle
        if (!bikeData.id || !bikeData.handle) {
            throw new Error();
        }

        // Make sure bike data contains all required fields
        const bikeObject = BikeData.check(bikeData);

        // Delete existing bike object
        await bikesCollection.delete(bikeId);

        // Save new bike object
        await bikesCollection.set(bikeId, bikeObject);

        res.send(bikeObject);
    } catch (e) {
        console.log(`PUT bikes/${bikeId}`, e.message);
        res.sendStatus(404);
    }
});

// ------------------------------------
// PATCH ROUTES
// ------------------------------------

// Patch bike if it exists 更新数据/传入想要修改的参数即可
router.patch("/:id", authenticateUser, async (req, res) => {
    const bikeId = req.params.id;
    const newData = req.body || {};

    try {
        const { props: oldBike } = await bikesCollection.get(bikeId);

        // Save new bike object
        await bikesCollection.set(bikeId, newData);

        const bike = { ...oldBike, ...newData };

        res.send(bike);
    } catch (e) {
        console.log(`PATH /bikes/${bikeId}`, e.message);
        res.sendStatus(404);
    }
});

// ------------------------------------
// DELETE ROUTES
// ------------------------------------

// Delete bike if it exists
router.delete("/:id", authenticateUser, async (req, res) => {
    const bikeId = req.params.id;

    try {
        await bikesCollection.delete(bikeId);

        res.send({ id: bikeId });
    } catch (e) {
        console.log(`DELETE /bikes/${bikeId}`, e.message);
        res.sendStatus(404);
    }
});