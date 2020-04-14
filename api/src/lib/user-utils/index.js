//@ts-check
'use strict'

const cleanPhone = (phone, international = false) => {
  if (phone && !international) return phone.replace(/^0/, "33")
  if (phone && international) return phone.replace(/^0/, "+33")
  return null
}

module.exports = {
  cleanPhone
}
