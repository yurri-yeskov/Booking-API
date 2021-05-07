var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');
var Event  = mongoose.model('Event');
var auth = require('../../utils/auth');
var moment = require('moment');

router.post('/create', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var event = new Event();
	event.creatorRef = myUser.id;
	event.relationship = req.body.event.relationship;
	event.relativeRef = req.body.event.relativeRef;
	event.name = req.body.event.name;
	event.category = req.body.event.category;
	event.startDate = req.body.event.startDate;
	event.endDate = req.body.event.endDate;
	event.startTime = req.body.event.startTime;
	event.endTime = req.body.event.endTime;
	event.repeat = req.body.event.repeat;
	event.notes = req.body.event.notes;
	event.isAllDay = req.body.event.isAllDay;
	event.repeat = req.body.event.repeat;

	event.save().then(function() {
		return res.json({ event });
	}).catch(next);
})

router.get('/grouped-by-dates/year/:year/month/:month', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var eventsGroupedByDate = [];
	var startDate = moment([req.params.year, req.params.month-1]);
	var endDate = moment(startDate).endOf('month');

	for (var date = startDate; date.isBefore(endDate); date.add(1, 'days')) {
		date_ = date.format('YYYY-MM-DD');
		await Event.find({ 
			"creatorRef": myUser.id,
			"startDate": { $lte: date_ },
			"endDate": { $gte: date_ }
		}).populate('creatorRef').populate('relativeRef').then(events => {
			eventsGroupedByDate.push({
				date: date_,
				events
			});
		});
	}

	return res.json({
		eventsGroupedByDate
	})
	
})

router.get('/list-by-date/date/:date', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	Event.find({ 
		"creatorRef": myUser.id,
		"startDate": { $lte: req.params.date },
		"endDate": { $gte: req.params.date }
	}).populate('creatorRef').populate('relativeRef').then(events => {
		return res.json({
			events
		})
	});
})

router.get('/list-between/from-date/:fromDate/to-date/:toDate', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	Event.find({ 
		"creatorRef": myUser.id,
		"startDate": { $lte: req.params.toDate },
		"endDate": { $gte: req.params.fromDate }
	}).populate('creatorRef').populate('relativeRef').then(events => {
		return res.json({
			events
		})
	});
})

module.exports = router;
