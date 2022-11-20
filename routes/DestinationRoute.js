const express = require("express");
const TripSchema = require("../module/TripSchema")
const DestinationSchema = require("../module/DestinationSchema")
const AppUntil = require("../AppUntil");
const _ = require("lodash");
const { TypeDestination } = require("../constant/TypeDestination");
const moment = require("moment");
const router = express.Router();

router.get("/index", async (req, res) => {
    try {
        const trip = await TripSchema.findOne({ _id: req.query.tripId })
        if (trip && trip.createBy == req.currentUser._id) {
            let destinations = await DestinationSchema.find({ tripId: req.query.tripId })

            if (destinations) {
                if (req.query?.searchText) {
                    destinations = _.filter(destinations, x =>
                        _.includes(_.toUpper(AppUntil.ConvertTextVnToEn(x.name)), _.toUpper(AppUntil.ConvertTextVnToEn(req.query?.searchText?.trim()))) ||
                        _.includes(_.toUpper(AppUntil.ConvertTextVnToEn(x.place)), _.toUpper(AppUntil.ConvertTextVnToEn(req.query?.searchText?.trim())))
                    )
                }
                return res.status(200)
                    .send(AppUntil.ResResult(200, true, destinations, "Get data success"))
            }
        }
        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Get data fail"))
    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Get data fail"))
    }
})


router.get("/show/:id", async (req, res) => {
    try {
        const destination = await DestinationSchema.findOne({ _id: req.params.id })
        if (destination) {
            return res.status(200)
                .send(AppUntil.ResResult(200, true, destination, "Get data success"))
        }
        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Get data fail"))
    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Get data fail"))
    }
})

router.post("/create", async (req, res) => {
    try {
        const { longitude, latitude, name, description, time, place, price, type, tripId } = req.body;
        const trip = await TripSchema.findOne({ _id: tripId })

        if (trip && trip.createBy == req.currentUser._id) {
            const newDestination = new DestinationSchema({ longitude, latitude, name, description, time, place, price, type, tripId })
            await newDestination.save()
            return res.status(200)
                .send(AppUntil.ResResult(200, true, {}, "Create destination success"))
        }
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Create data fail"))
    } catch (e) {
        console.log(987)
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Create data fail"))
    }
})



router.post("/update/:id", async (req, res) => {
    try {
        const { longitude, latitude, name, description, time, place, price, type, tripId } = req.body;
        const findDes = await DestinationSchema.findOne({ _id: req.params.id });
        if (findDes) {
            await DestinationSchema.updateOne({ _id: findDes._id }, {
                $set: {
                    longitude, latitude, name, description, time, place, price, type, tripId
                }
            })
            const result = await DestinationSchema.findOne({ _id: req.params.id });
            return res.status(200)
                .send(AppUntil.ResResult(200, true, result, "Update destination success"))
        }
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Update destination fail"))
    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Update destination fail"))
    }
})

router.delete("/delete/:id", async (req, res) => {
    try {
        const findDes = await DestinationSchema.findOne({ _id: req.params.id });
        if (findDes) {
            await DestinationSchema.deleteOne({ _id: req.params.id })
            return res.status(200)
                .send(AppUntil.ResResult(200, true, {}, "Delete destination success"))
        }
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Update destination fail"))
    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Update destination fail"))
    }
})




router.get("/get-lat-log/:tripId", async (req, res) => {
    try {
        const findDes = await DestinationSchema.find({ tripId: req.params.tripId });
        const result = findDes.map(item => {
            return {
                latitude: item.latitude,
                longitude: item.longitude,
            }
        })
        return res.status(200)
            .send(AppUntil.ResResult(200, true, result, "Get Data success"))
    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Update destination fail"))
    }
})

router.get("/dashboard-time", async (req, res) => {
    try {
        const destination = await DestinationSchema.find({ tripId: req.query.tripId })
        if (destination) {

            const results = [];


            _.map(_.sortBy(destination, x => x.time), item => {
                const findIndex = _.findIndex(results, x => x.time === moment(item.time).format("ll"))
                if (findIndex !== -1) {
                    const findStacks = _.get(results, `[${findIndex}].stacks`)
                    console.log(findStacks, "findStacks")
                    results[findIndex] = {
                        label: moment(item.time).format("ll"),
                        time: moment(item.time).format("ll"),
                        stacks: [
                            {
                                key: 1,
                                value: item.type === "EATING" ? (item.price + AppUntil.GetPriceValueType("EATING", findStacks)) : AppUntil.GetPriceValueType("EATING", findStacks),
                                color: '#A10035',
                                type: "EATING",
                                onPress: () => { }
                            },
                            {
                                key: 2,
                                value: item.type === "ACCOMMODATION" ? (item.price + AppUntil.GetPriceValueType("ACCOMMODATION", findStacks)) : AppUntil.GetPriceValueType("ACCOMMODATION", findStacks),
                                color: '#FEC260',
                                type: "ACCOMMODATION",
                                onPress: () => { }
                            },
                            {
                                key: 3,
                                value: item.type === "OTHER" ? (item.price + AppUntil.GetPriceValueType("OTHER", findStacks)) : AppUntil.GetPriceValueType("OTHER", findStacks),
                                color: '#3FA796',
                                type: "OTHER",
                                onPress: () => { }
                            },
                        ]
                    }
                } else {
                    results.push({
                        stacks: [
                            {
                                key: 1,
                                value: item.type === "EATING" ? item.price : 0,
                                color: '#A10035',
                                type: "EATING",
                                onPress: () => { }
                            },
                            {
                                key: 2,
                                value: item.type === "ACCOMMODATION" ? item.price : 0,
                                color: '#FEC260',
                                type: "ACCOMMODATION",
                                onPress: () => { }
                            },
                            {
                                key: 3,
                                value: item.type === "OTHER" ? item.price : 0,
                                color: '#3FA796',
                                type: "OTHER",
                                onPress: () => { }
                            },
                        ],
                        label: moment(item.time).format("ll"),
                        time: moment(item.time).format("ll")
                    })
                }
            })
            console.log("price", results)


            return res.status(200)
                .send(AppUntil.ResResult(200, true, results, "Get data success"))
        }

        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Get data fail"))

    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Update destination fail"))
    }
})

router.get("/dashboard-map", async (req, res) => {
    try {
        const destination = await DestinationSchema.find({ tripId: req.query.tripId })

        if (destination) {
            const results = [];
            _.map(destination, item => {
                const findIndex = _.findIndex(results, x => x.latitude === item.latitude && x.longitude === item.longitude);
                if (findIndex !== -1) {
                    results[findIndex].des.push({
                        place: item?.place,
                        name: item?.name,
                        price: item?.price,
                        description: item?.description,
                    })
                } else {
                    results.push({
                        latitude: item.latitude,
                        longitude: item.longitude,
                        des: [
                            {
                                place: item?.place,
                                name: item?.name,
                                price: item?.price,
                                description: item?.description,
                            }
                        ]
                    })
                }
            })
            console.log(results, "destination")

            return res.status(200)
                .send(AppUntil.ResResult(200, true, results, "Get data success"))
        }

        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Get data fail"))

    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Update destination fail"))
    }
})


router.get("/dashboard", async (req, res) => {
    try {
        const destination = await DestinationSchema.find({ tripId: req.query.tripId })
        if (destination) {

            const filterEating = _.filter(destination, x => x.type === "EATING")
            const filterAccommodation = _.filter(destination, x => x.type === "ACCOMMODATION")
            const filterOther = _.filter(destination, x => x.type === "OTHER")

            const sum = _.sumBy(destination, x => x.price)

            const sumE = _.sumBy(filterEating, x => x.price)
            const sumA = _.sumBy(filterAccommodation, x => x.price)
            const sumO = _.sumBy(filterOther, x => x.price)

            const results = [
                {
                    type: "EATING",
                    key: "11",
                    text: sumE > 0 ? (sumE / sum * 100).toFixed(0) + "%" : 0,
                    value: sumE > 0 ? (sumE / sum * 100) : 0,
                    price: sumE,
                    color: "#A10035",
                },
                {
                    type: "ACCOMMODATION",
                    text: sumA > 0 ? (sumA / sum * 100).toFixed(0) + "%" : 0,
                    value: sumA > 0 ? (sumA / sum * 100) : 0,
                    price: sumA,
                    color: "#FEC260",
                    key: "12",
                },
                {
                    type: "OTHER",
                    text: sumO > 0 ? (sumO / sum * 100).toFixed(0) + "%" : 0,
                    value: sumO > 0 ? (sumO / sum * 100) : 0,
                    price: sumO,
                    color: "#3FA796",
                    key: "13",
                }
            ]

            return res.status(200)
                .send(AppUntil.ResResult(200, true, results, "Get data success"))
        }

        return res.status(500)
            .send(AppUntil.ResResult(500, false, [], "Get data fail"))

    } catch (e) {
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "Update destination fail"))
    }
})

module.exports = router;