// @ts-check

/**
 * Accessing nested JavaScript objects with string key
 * @param {*} path
 * @param {*} obj
 * @param {*} separator
 */
function getPathInObject(path, obj, separator = '.') {
  const properties = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

const groupBy = (list = [], field = '') => {
  return list.reduce((acc, element) => {
    const newElement = element
    if (!acc[getPathInObject(field, newElement)]) {
      newElement.nb = 0
      acc[getPathInObject(field, newElement)] = newElement
    }

    acc[getPathInObject(field, newElement)].nb += 1
    return acc
  }, {})
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      // for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    })
  }

  return mergeDeep(target, ...sources)
}

function randomIntBetween(min = 1000, max = 9999) {
  return Math.floor(Math.random() * (max - min + 1) + 100)
}

const capitalize = s => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function monkeyPatch(object, prop, func) {
  const newObject = object
  const realFunction = object[prop]

  newObject[prop] = func(realFunction)
  return newObject
}

/**
 * Deeply copies an object
 * @param {object} obj Object to Copy
 * @return {object}
 */
const deepCopy = obj => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) {
    const copy = new Date()
    copy.setTime(obj.getTime())
    return copy
  }
  if (obj instanceof Array) {
    const copy = []
    for (let i = 0, len = obj.length; i < len; i += 1) {
      copy[i] = deepCopy(obj[i])
    }
    return copy
  }
  if (obj instanceof Object) {
    const copy = {}

    Object.keys(obj).forEach(attr => {
      if (Object.prototype.hasOwnProperty.call(obj, attr))
        copy[attr] = deepCopy(obj[attr])
    })
    return copy
  }

  throw new Error('Unable to copy obj this object.')
}

const snakeToCamel = str =>
  str.replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  )

/**
 * Construct option property to obj from property starting with "option_"
 * @param {*} obj
 */
const convertFieldsToOptions = obj => {
  return Object.keys(obj).reduce((param, property) => {
    if (property.startsWith('option_')) {
      if (!param.options) param.options = {}

      param.options[property.replace('option_', '')] = obj[property]
    } else {
      param[property] = obj[property]
    }

    return param
  }, {})
}

const convertOptionsToFields = obj => {
  if (obj.options) {
    Object.keys(obj.options).forEach(optionName => {
      obj[`option_${optionName}`] = obj.options[optionName]
    })

    delete obj.options
  }

  return obj
}

module.exports = {
  groupBy,
  getPathInObject,
  isObject,
  mergeDeep,
  randomIntBetween,
  capitalize,
  monkeyPatch,
  deepCopy,
  snakeToCamel,
  convertFieldsToOptions,
  convertOptionsToFields,
}
