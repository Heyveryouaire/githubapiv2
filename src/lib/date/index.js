//@ts-check
'use strict'

const moment = require('moment')

const addMinutesToDate = (date, minutes = 0) => moment(date).add(minutes, "minutes").format()

const removeMinutesToDate = (date, minutes = 0) => moment(date).subtract(minutes, "minutes").format()

const formatDate = (date) => moment(date).format()

const duration = (dateStart, dateEnd, unit = "minutes") => moment(dateStart).diff(moment(dateEnd), unit)

const getMidnightDate = (date) => {
  const momentDate = moment(date).utcOffset(0);
  momentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  return momentDate.toDate()
}

const dayNumber = (date) => {
  let dayNum = date.getDay() - 1

  if (dayNum == -1) dayNum = 6
  return dayNum
}

const getEvenOrOddWeek = (date) => {
  return getWeek(date) % 2 == 0
}

// const dayNumber = (date) => {
//   let dayNum = date.getDay() - 1

//   if (dayNum == -1) dayNum = 6
//   return dayNum
// }

const getWeek = function (date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  // eslint-disable-next-line
  return Math.ceil((((date - onejan) / millisecsInDay) + onejan.getDay() + 1) / 7);
}

module.exports = {
  addMinutesToDate,
  removeMinutesToDate,
  formatDate,
  duration,
  getMidnightDate,
  dayNumber,
  getEvenOrOddWeek,
  getWeek
}
