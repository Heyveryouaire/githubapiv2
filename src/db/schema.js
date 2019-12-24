const path = require('path')

module.exports = (gstore) => {
  const { Schema } = gstore;

  /**
   * Create s gstore-node Schema
   * @param {*} fileName File model name (e.g: event.js). Will create model camel case and capitalize it.
   * @param {*} params Properties declaration
   * @param {*} hooks Hooks: pre/post on save/delete/findOne function (https://sebloix.gitbook.io/gstore-node/middleware-hooks)
   * e.g: { pre: { save: async () => { console.log('yeah') } } }
   */
  const createSchema = (fileName, params, hooks = null) => {
    const name = camelizeAndCapitalize(path.basename(fileName).replace('.js', ''))

    const newSchema = new Schema({
      ...params,
      created_at: { type: Date, default: gstore.defaultValues.NOW },
      updated_at: { type: Date, default: gstore.defaultValues.NOW },
    })

    newSchema.pre('save', async function () {
      this.updated_at = new Date()
    })

    if (hooks) {
      Object.keys(hooks).forEach(hookName => {
        Object.keys(hooks[hookName]).forEach(method => {
          newSchema[hookName](method, hooks[hookName][method]);
        })
      })
    }

    const Model = gstore.model(name, newSchema)

    /**
     * Monkey patch Update function, to retry when too much conentions error.
     */
    monkeyPatch(Model, 'update', realFunction => async function (...args) {
      try {
        return await realFunction.apply(this, args)
      } catch (error) {
        console.error(error.message)

        // If too much contentions, retry in 2s.
        if (error.code == 10) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(Model.update(args[0], args[1]))
            }, 1000)
          })
        }

        throw error
      }
    })

    return Model
  }

  return {
    createSchema,
    Schema
  }
}

function monkeyPatch(object, prop, func) {
  const realFunction = object[prop]

  object[prop] = func(realFunction)
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index == 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '').replace(/-/g, '');
}

function camelizeAndCapitalize(str) {
  let newStr = camelize(str)
  return newStr.charAt(0).toUpperCase() + newStr.substring(1)
}
