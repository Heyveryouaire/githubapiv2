// import { storeApi } from '../store'
import { API_URL } from "./constants";
/* eslint-disable class-methods-use-this */
const ROUTES = {
  USERS: `${API_URL}/users`,
  STEPS: `${API_URL}/steps`,
  CREATEISSUE : `${API_URL}/githubapi`,
  GOOGLEIT : `${API_URL}/googleit`
};
const DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};
const queryParams = qs => {
  if (qs && Object.keys(qs).length > 0) {
    return `?${Object.entries(qs)
      .map(([key, value]) => [key, encodeURIComponent(value)].join("="))
      .join("&")}`;
  }
  return "";
};
function request(method, url, { token, body, query, fileName } = {}) {
  const options = {
    method: method.toUpperCase(),
    headers: token
      ? {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`
          // role,
        }
      : DEFAULT_HEADERS,
    body: body ? JSON.stringify(body) : undefined
  };
  // console.log(options);
  
  // Object.entries(options.headers).forEach(([key, value]) => console.log(key, ':', value))
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const error = new Error("Le service est temporairement indisponible");
      error.type = "Request Timout";
      // storeApi.setState({
      //   msgAppWide: { message: error.message, type: 'error' },
      // })
      reject(error);
    }, 30000);
    url += queryParams(query);    
    fetch(url, options)
      .then(async response => {
        clearTimeout(timeout);
        if (response.status === 404) {
          response.text().then(text => {
            const error = new Error(text);
            error.type = "Not found";
            // storeApi.setState({
            //   msgAppWide: { message: error.message, type: 'error' },
            // })
            reject(error);
          });
        } else if (response.status >= 200 && response.status <= 202) {
          if (/.*csv.*/.test(response.headers.get("Content-Type"))) {
            const blob = await response.blob();
            const fileUrl =
              typeof window !== "undefined" && window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = fileUrl;
            // the filename you want
            a.download = `${fileName}_${new Date().toLocaleDateString()}.csv`;
            document.body.appendChild(a);
            a.click();
            typeof window !== "undefined" &&
              window.URL.revokeObjectURL(fileUrl);
            resolve();
          } else {
            response.json().then(json =>
              resolve({
                results: json,
                total: response.headers.get("X-Total-Count")
              })
            );
          }
        } else if (response.status >= 203 && response.status < 300) {
          try {
            resolve({
              results: { success: true },
              total: response.headers.get("X-Total-Count")
            });
          } catch (error) {
            // storeApi.setState({
            //   msgAppWide: { message: error.message, type: 'error' },
            // })
            reject(error);
          }
        } else {
          response.text().then(text => {
            const error = new Error(text);
            error.type = "Not found";
            // storeApi.setState({
            //   msgAppWide: { message: error.message, type: 'error' },
            // })
            reject(error);
          });
        }
      })
      .catch(error => {
        console.log("error", error);
        error = new Error("Le service est temporairement indisponible");
        error.type = "Client Error";
        // storeApi.setState({
        //   msgAppWide: { message: error.message, type: 'error' },
        // })
        reject(error);
      });
  });
}
function post(url, params) {
  return request("post", url, params);
}
function put(url, params) {
  return request("put", url, params);
}
function patch(url, params) {  
  return request("patch", url, params);
}
function get(url, params) {
  return request("get", url, params);
}
function del(url, params) {
  return request("delete", url, params);
}
async function getOne({ route, id, token, query }) {
  const req = await get(`${route}/${id}`, { token, query });
  if (req) {
    return req.results;
  }
  return null;
}
// DEBUG
function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
/**
 * @class
 * @name Api
 * @description Safir Api client
 * The weird wraping with a WeakMap is to keep the user token private
 */
export default {
  signin: params => {
    if (params.email === "error@mail.com") {
      throw new Error("Email invalide");
    }
    return post(`${ROUTES.USERS}/login`, { body: params });
  },
  signup: params => {
      console.log("API url ", API_URL);
      
    return post(`${ROUTES.USERS}`, { body: params });
  },
  getNlpModel: params => {
    return get(`${ROUTES.STEPS}/nlp-model`, {
      token: params.token
    });
  },
  createIssue: params => {
    return post(`${ROUTES.CREATEISSUE}/createIssue`, { body: params})
  },
  updateProfil: (params, token) => {
    return patch(`${ROUTES.USERS}`, { 
      body: params,
      token
    })
  },
  googleIt: params => {  
    return post(`${ROUTES.GOOGLEIT}`, {body: params})
  },
  viewListIssue : (params, token) => {
    console.log("api", params)
    return post(`${ROUTES.CREATEISSUE}/viewListIssue`, {
      body: params,
      token
    })
  }
};
