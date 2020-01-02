const { Op } = require("sequelize")

const convertOperator = operator => {
  let postgreOp = Op.and

  switch (operator) {
    case ">":
      postgreOp = Op.gt
      break
    case ">=":
      postgreOp = Op.gte
      break
    case "<":
      postgreOp = Op.lte
      break
    case "<=":
      postgreOp = Op.lte
      break
  }

  return postgreOp
}

module.exports = {
  convertOperator
}
