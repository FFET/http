/**
 * request
 */

import { BASE_API } from "../config";
import { Toast } from "Components";
import { Session as Storage } from "Utils/storage";
import { fetch } from "whatwg-fetch";
import { generateUuid } from "Utils/helper";

/**
 * request
 */
export default async function({
  url,
  method = "get",
  data = {},
  headers = {
    "Content-Type": "application/json"
  },
  loading = true,
  timeout = 300000
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

    // url
    url = url.includes("://") ? url : BASE_API + url;

    // header
    if (Object.keys(headers).length !== 0) {
      Object.assign(requestConfig.headers, headers);
    }
    //token
    if (!Storage.get("token")) {
      requestConfig.headers.token =
        Storage.get("token") == undefined ? "" : Storage.get("token");
    } else {
      requestConfig.headers.token = Storage.get("token");
    }

    let requestNo = Storage.get("requestNo");
    if (!requestNo) {
      requestNo = generateUuid();
      Storage.set("requestNo", requestNo);
    }

    requestConfig.headers.reqno = requestNo;

    // header
    requestConfig.headers = {
      ...requestConfig.headers,
      version: 1,
      source: "h5",
      lang: "zh"
    };

    // method & data
    if (method.toLowerCase() === "post") {
      // form or json
      const contentType = requestConfig.headers["Content-Type"];

      if (contentType === "application/json") {
        Object.values(data) &&
          Object.values(data).map((item, index) => {
            let key = Object.keys(data)[index] && Object.keys(data)[index];
            data[key] =
              typeof item == "string"
                ? item.replace(/(^\s*)|(\s*$)/g, "")
                : item;
          });
        Object.defineProperty(requestConfig, "body", {
          value: JSON.stringify(data)
        });
      } else if (contentType === "multipart/form-data") {
        const form = new FormData();
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            const files = data[key];
            for (let value of files) {
              form.append("file", value);
            }
          } else {
            form.append(key, data[key]);
          }
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
      url += "?" + str;
    }

    fetch(url, requestConfig)
      .then(response => {
        return response;
      })
      .then(response => {
        let responseData;
        switch (requestConfig.headers.Accept) {
          // json
          case "application/json":
            responseData = response.json();
            break;
          // text
          case "text/html":
            responseData = response.text();
            break;
          // download
          case "application/octet-stream":
            const blob = response.blob();
            responseData = {
              blob,
              filename: response.headers.get("Content-Disposition"),
              type: "file"
            };
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
      Toast.hide();
      reject(new Error("请求超时"));
    }, timeout);
  });

  // loadign
  if (loading && !document.getElementById("loading")) {
    const divContainer = document.createElement("div");
    divContainer.id = "loading";

    const spinner = document.createElement("div");
    spinner.className = "spinner";

    for (let index = 0; index < 3; index++) {
      spinner.appendChild(document.createElement("div"));
    }
    divContainer.appendChild(spinner);
    document.body.appendChild(divContainer);
  }

  // check network
  if (!window.navigator.onLine) {
    Toast.pageTip("没有网络");
    return;
  }

  try {
    const result = await Promise.race([fetchPromise, timeoutPromise]);

    const loadElement = document.getElementById("loading");
    if (loadElement) {
      if (/Trident\/7\./.test(navigator.userAgent)) {
        loadElement.removeNode(true);
      } else {
        loadElement.remove();
      }
    }

    if (result.type === "file") {
      let { blob, filename } = result;
      filename = decodeURI(filename);
      blob.then(data => {
        const blob = new Blob([data], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
        });
        const ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
          ie11 =
            navigator.userAgent.match(/Trident\/7.0/) &&
            navigator.userAgent.match(/rv:11/),
          ieEDGE = navigator.userAgent.match(/Edge/g),
          ieVer = ie ? ie[1] : ie11 ? 11 : ieEDGE ? 12 : -1;
        console.log("ie:" + ie);
        console.log("ieVer:" + ieVer);
        if (ie && ieVer < 10) {
          this.message.error("No blobs on IE<10");
          return;
        }
        if (ieVer > -1) {
          window.navigator.msSaveBlob(blob, filename.split("=")[1]);
        } else {
          const url = window.URL.createObjectURL(blob);
          let link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", filename.split("=")[1]);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    } else {
      if (result.code == 100) {
        Toast.reLogins("登录超时,请重新登录!");
        return;
      }
      if (+result.code !== 0) {
        Toast.msg(result.msg || result.errmsg);
      } else {
        result.state = true;
      }
      return result;
    }
  } catch (error) {
    Toast.hide();
    console.log("catch", error);
    Toast.msg(error.message);
  }
}
