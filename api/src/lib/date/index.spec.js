describe("test date utils", () => {

  const moment = require('moment')
  const { addMinutesToDate, removeMinutesToDate } = require('./index')

  it("test addMinutesToDate", () => {
    const date = new Date()
    const newDate = addMinutesToDate(date, 10)

    let diff =  moment(newDate).diff(moment(date), "minutes")

    expect(diff).toBeGreaterThanOrEqual(9)
    expect(diff).toBeLessThanOrEqual(11)
  })

  it("test addMinutesToDate", () => {
    const date = new Date()
    const newDate = removeMinutesToDate(date, 10)

    let diff =  moment(date).diff(moment(newDate), "minutes")

    expect(diff).toBeGreaterThanOrEqual(9)
    expect(diff).toBeLessThanOrEqual(11)
  })
})
