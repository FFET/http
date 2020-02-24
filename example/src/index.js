import http from "../../src";

// console.log(http);

(async function() {
  const data = await http.get("http://scorpioner.xicp.net/pneumonia/query");
  console.log(data);
})();
