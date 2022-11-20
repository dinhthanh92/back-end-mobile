const express = require("express");
const TripSchema = require("../module/TripSchema")
const DestinationSchema = require("../module/DestinationSchema")
const moment = require("moment");
const AppUntil = require("../AppUntil");
const _ = require("lodash");
const router = express.Router();

router.get("/index", async (req, res) => {
    try {
        let trips = await TripSchema.find({ createBy: req.currentUser._id });
        if (req.query?.name?.trim() != "") {
            trips = _.filter(trips, x => _.includes(_.toUpper(x.name), _.toUpper(req.query?.name?.trim())))
        }
        trips = _.reverse(trips)

        return res.status(200)
            .send(AppUntil.ResResult(200, true, trips, "Get data success"))
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, {}))
    }

})

router.delete("/delete-async", async (req, res) => {
    try {
        let trips = await TripSchema.find({ createBy: req.currentUser._id });
        if (trips) {
            const tripIds = _.map(trips, item => item._id.toString())
            await TripSchema.deleteMany({ createBy: req.currentUser._id });
            await DestinationSchema.deleteMany({ tripId: { $in: tripIds } })
            return res.status(200)
                .send(AppUntil.ResResult(200, true, {}, "Clear data success"))
        }
        return res.status(200)
            .send(AppUntil.ResResult(200, true, {}, "Clear data success"))
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, {}))
    }

})

router.get("/show/:id", async (req, res) => {
    try {
        let trip = await TripSchema.findOne({ _id: req.params.id });
        if (trip && trip.createBy == req.currentUser._id) {
            let destinations = await DestinationSchema.find({ tripId: trip._id })
            const result = {
                ...trip._doc,
                totalPrice: _.sumBy(destinations, x => x.price) || 0
            }
            return res.status(200)
                .send(AppUntil.ResResult(200, true, result, "Get data success"))
        }
        return res.status(500)
            .send(AppUntil.ResResult(400, false, {}))
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, {}))
    }

})

router.post("/create", async (req, res) => {
    try {
        const { name, startTime, endTime } = req.body
        const newTrip = new TripSchema({ name, startTime, endTime, createBy: req.currentUser._id });
        await newTrip.save()
        return res.status(200)
            .send(AppUntil.ResResult(200, true, {}, "Create trip success"))
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}))
    }
})

router.post("/update/:id", async (req, res) => {
    try {
        const { name, startTime, endTime } = req.body
        const trip = await TripSchema.findOne({ _id: req.params.id })
        if (trip) {
            await TripSchema.updateOne({ _id: trip._id }, { $set: { name, startTime, endTime } })
            const newTrip = await TripSchema.findOne({ _id: req.params.id })
            return res.status(200)
                .send(AppUntil.ResResult(200, true, newTrip, "Update trip success"))
        } else {
            return res.status(500)
                .send(AppUntil.ResResult(500, false, {}))
        }
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}))
    }
})

router.delete("/delete/:id", async (req, res) => {
    try {
        const trip = await TripSchema.findOne({ _id: req.params.id })
        if (trip) {
            await TripSchema.deleteOne({ _id: req.params.id })
            await DestinationSchema.deleteMany({ tripId: req.params.id })
            return res.status(200)
                .send(AppUntil.ResResult(200, true, {}, "Delete trip success"))
        } else {
            return res.status(500)
                .send(AppUntil.ResResult(500, false, {}))
        }
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(500, false, {}))
    }
})

module.exports = router