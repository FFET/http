/**
 * request
 */

import { BASE_API } from "Config";
import { Toast } from "Components";
import { Session as Storage, Application } from "Utils/storage";
import { fetch } from "whatwg-fetch";
import NProgress from "nprogress";

/**
 * request
 */
export default async function({
  url,
  method = "post",
  data = {},
  headers = { "Content-Type": "application/json" },
  loading = true,
  timeout = 20000
}) {
  // fetch promise
  const fetchPromise = new Promise(resolve => {
    let requestConfig = {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };

    if (!url) return;
    // url
    url = url.includes("//") || url.includes("json") ? url : BASE_API + url;

    //token
    if (Storage.get("token")) {
      requestConfig.headers.UTOKEN = Storage.get("token");
    }

    // header
    if (Object.keys(headers).length !== 0) {
      Object.assign(requestConfig.headers, headers);
    }

    // header
    requestConfig.headers = {
      ...requestConfig.headers
    };

    // method & data
    if (method.toLowerCase() === "post" || method.toLowerCase() === "put") {
      // form or json
      const contentType = requestConfig.headers["Content-Type"];
      if (contentType === "application/json") {
        Object.defineProperty(requestConfig, "body", {
          value: JSON.stringify(data)
        });
      } else if (contentType === "multipart/form-data") {
        // file upload
        const form = new FormData();
        Object.keys(data).forEach(key => {
          form.append(key, data[key]);
        });
        Object.defineProperty(requestConfig, "body", {
          value: form
        });
        delete requestConfig.headers["Content-Type"];
      }
    } else if (method.toLowerCase() === "get") {
      const str = Object.entries(data)
        .reduce((acc, cur) => acc.concat(cur.join("=")), [])
        .join("&");
      if (str) {
        url += "?" + str;
      }
    }

    fetch(url, requestConfig)
      .then(response => {
        // 数据检验
        return response;
      })
      .then(response => {
        // 解析数据
        let responseData;
        switch (requestConfig.headers.Accept) {
          // json
          case "application/json":
            responseData = response.json();
            break;
          // 文本
          case "text/html":
            responseData = response.text();
            break;
          // 文件下载
          case "application/octet-stream":
            const blob = response.blob();
            const a = document.createElement("a");
            const fileurl = window.URL.createObjectURL(blob);
            const filename = response.headers.get("Content-Disposition");
            a.href = fileurl;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(fileurl);
            break;
        }
        return responseData;
      })
      .then(data => {
        resolve(data);
      });
  });

  // timeout promise
  const timeoutPromise = new Promise(function(resolve, reject) {
    const time = setTimeout(() => {
      clearTimeout(time);
      reject(new Error("请求超时"));
    }, timeout);
  });

  // loading
  loading && NProgress.start();

  // check network
  if (!window.navigator.onLine) {
    console.log("没有网络");
    Toast.fail("没有网络");
    return;
  }

  try {
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    NProgress.done();

    if (+result.code !== 0) {
      if (result.code === 402) {
        Toast.fail(result.msg || result.error, 1, () => {
          Storage.clear();
          Application.clear();
          window.location.reload();
        });
      } else {
        Toast.fail(result.msg || result.error);
      }
    } else {
      result.status = true;
    }
    return result;
  } catch (error) {
    console.log("catch", error);
    Toast.fail(error.message);
  } finally {
    NProgress.remove();
  }
}
