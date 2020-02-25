import http from "../../src";

// console.log(http);

// (async function() {
//   // const data = await http.get("http://scorpioner.xicp.net/pneumonia/query");
//   const data = await http.get("http://localhost:7000/pneumonia/query");
//   console.log(data);
// })();

// (async function() {
//   const data = await http.get("http://localhost:7000/test/get", {
//     name: "jay"
//   });
//   console.log("get", data);
// })();

(async function() {
  // const data = await http.get("http://localhost:7000/test/query?name=jay");
  const data = await http.post("http://localhost:7000/test/post", {
    name: "jay"
  });
  console.log("post", data);
})();

(async function() {
  // const data = await http.get("http://localhost:7000/test/query?name=jay");
  const data = await http.post(
    "http://localhost:7000/test/postForm",
    {
      name: "jay"
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  console.log("post", data);
})();
