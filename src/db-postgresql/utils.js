const { Op } = require("sequelize")

const convertOperator = operator => {
  let postgreOp = Op.and

  switch (operator) {
    case '>':
      postgreOp = Op.gt
      break
    case '>=':
      postgreOp = Op.gte
      break
    case '<':
      postgreOp = Op.lte
      break
    case '<=':
      postgreOp = Op.lte
      break
    case '!=':
      postgreOp = Op.not
      break
  }

  return postgreOp
}

const formatOpts = (model, opts = {}) => {
  if (opts.populate) {
    if (Array.isArray(opts.populate)) {
      opts.include = opts.populate
    } else {
      opts.include = model.populate
    }
  }

  delete opts.populate

  return opts
}

const getFormattedFilters = (filters = []) => {
  return filters.reduce((formattedFilters, filter) => {
    if (filter.length === 2) {
      formattedFilters[filter[0]] = filter[1]
    } else {
      const operator = convertOperator(filter[1])
      formattedFilters[filter[0]] = { [operator]: filter[2] }
    }

    return formattedFilters
  }, {})
}

module.exports = {
  convertOperator,
  formatOpts,
  getFormattedFilters,
  Op,
}
