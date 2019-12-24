//@ts-check
'use strict'

const groupBy = (list = [], field = "") => {
  return list
    .reduce((acc, element) => {
      if (!acc[getPathInObject(field, element)]) {
        element.nb = 0
        acc[getPathInObject(field, element)] = element
      }

      acc[getPathInObject(field, element)].nb++
      return acc
    }, {})
}

/**
 * Accessing nested JavaScript objects with string key
 * @param {*} path 
 * @param {*} obj 
 * @param {*} separator 
 */
function getPathInObject(path, obj, separator = '.') {
  var properties = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}


/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function randomIntBetween(min = 1000, max = 9999) {
  return Math.floor(Math.random() * (max - min + 1) + 100)
}

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

module.exports = {
  groupBy,
  getPathInObject,
  isObject,
  mergeDeep,
  randomIntBetween,
  capitalize
}
