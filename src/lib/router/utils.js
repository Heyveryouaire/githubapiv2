const { convertOperator, Op } = require("../../db-postgresql/utils")

/**
 * Format filters.
 * If filter field contains ".", that means filter must be applied on join table.
 * It's not treated here.
 * @param {*} filters
 */
const getFormattedFilters = (query, filters) => {
  return filters.reduce(
    (formattedFilters, filter) => {
      let newFilter

      if (filter.length === 2) {
        // formattedFilters.where[filter[0]][Op.and].push({ [Op.eq]: filter[1] })
        newFilter = { [Op.eq]: filter[1] }
      } else {
        const operator = convertOperator(filter[1])
        newFilter = { [operator]: filter[2] }
      }

      let elementToFilter, modelName

      if (filter[0].indexOf(".") === -1) {
        elementToFilter = formattedFilters
      } else {
        const modelFilterIndex = formattedFilters.include.findIndex(
          model =>
            filter[0].indexOf(`${model.name}.`) === 0 ||
            (model.model && filter[0].indexOf(`${model.model.name}.`) === 0)
        )

        if (modelFilterIndex > -1) {
          modelName = formattedFilters.include[modelFilterIndex].name
            ? formattedFilters.include[modelFilterIndex].name
            : formattedFilters.include[modelFilterIndex].model.name

          if (!formattedFilters.include[modelFilterIndex].model) {
            formattedFilters.include[modelFilterIndex] = {
              model: { ...formattedFilters.include[modelFilterIndex] }
            }
          } else {
            formattedFilters.include[modelFilterIndex] = {
              ...formattedFilters.include[modelFilterIndex]
            }
          }

          elementToFilter = formattedFilters.include[modelFilterIndex]
          // elementToFilter = { ...formattedFilters.include[modelFilterIndex] }

          filter[0] = filter[0].replace(`${modelName}.`, "")
        }
      }

      if (!elementToFilter.where) {
        elementToFilter.where = {}
      }
      if (!elementToFilter.where[filter[0]]) {
        elementToFilter.where[filter[0]] = { [Op.and]: [] }
      }

      // elementToFilter = elementToFilter.where[filter[0]][Op.and]

      elementToFilter.where[filter[0]][Op.and].push(newFilter)

      return formattedFilters
    },
    { ...query }
  )
}

const constructQuery = ({ req, Model }) => {
  if (req.query.order) {
    try {
      req.query.order = JSON.parse(req.query.order)
    } catch (err) {
      console.error(err)
    }
  }

  let filters = []

  if (req.query.filters) {
    try {
      filters = JSON.parse(req.query.filters)
    } catch (err) {
      console.error(err)
    }
  }

  if (req.query.populate && Model.populate) {
    req.query.include = [...Model.populate]
  }

  return getFormattedFilters(
    req.query,
    filters
    // raw: true
  )
}

const listEntities = async ({ req, Model }) => {
  const formattedFilters = constructQuery({ req, Model })

  const results = await Model.findAndCountAll(formattedFilters)

  return {
    entities: results.rows.map(r => r.toJSON()),
    totalCount: results.count
  }
}

module.exports = { listEntities, constructQuery }
