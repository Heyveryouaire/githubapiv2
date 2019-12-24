
const init = (MANDRILL_API_KEY, BASE_URL, SEND_MAIL = true) => {
  const mandrill = require('mandrill-api/mandrill')
  const mandrill_client = new mandrill.Mandrill(MANDRILL_API_KEY)

  const sendEmail = (template_name, targetEmailAddress, params = {}) => {
    params.BASE_URL = BASE_URL

    return new Promise(resolve => {

      const message = {
        'subject': params.SUBJECT,
        'to': [{
          'email': targetEmailAddress,
          'type': 'to'
        }],
        'track_opens': false,
        'track_clicks': false,
        'merge_language': 'handlebars',
        'global_merge_vars': arrayFromObject(params)
      };

      const template = {
        template_content: [],
        template_name,
        message
      }

      if (process.env.NODE_ENV != "test" && SEND_MAIL) {
        mandrill_client.messages.sendTemplate(template, (result) => {
          console.log("SEND MAIL", result)
          resolve({ success: true, result })
        }, (e) => {
          console.error(e)
          resolve({ success: false, error: e })
        })
      } else if (process.env.NODE_ENV != "test") console.log('-- TEST SEND MAIL', message)
    })
  }

  return {
    sendEmail
  }
}

const arrayFromObject = (content) => {
  const val = [];
  for (const key in content) {
    val.push({ name: key, content: content[key] })
  }
  return val;
}

module.exports = init
