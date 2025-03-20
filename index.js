const http = require("http");
const url = require("url");
let body = [];
let city = "";
let temp = "";
const getFormInputCity = () =>
  `<form method="POST" action="/inquiry">
    <input name="city" required />
    <button type="submit">Какая погода </button>
  </form>`;

const weatherCity = () => `<p>Сейчас ${temp} градусов</p>`;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8;");

  const urlParsed = url.parse(req.url, true);
  const { pathname, query } = urlParsed;

  if (pathname === "/" || pathname === "index.js") {
    res.write(getFormInputCity());
    if (temp != "") {
      res.write(weatherCity());
    }
  } else if (pathname === "/inquiry") {
    body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        city = decodeURIComponent(body.split("=")[1]);
        http
          .get(
            `http://api.weatherstack.com/current?access_key=${process.env.KEY}&query=${city}`,
            (res) => {
              const { statusCode } = res;
              if (statusCode !== 200) {
                console.log(`statusCode: ${statusCode}`);
                return;
              }

              res.setEncoding("utf8");
              let rowData = "";
              res.on("data", (chunk) => (rowData += chunk));
              res.on("end", () => {
                let parseData = JSON.parse(rowData);
                temp = parseData.current.temperature;
                console.log(temp);
              });
            }
          )
          .on("error", (err) => {
            console.error(err);
          });
      });
    res.writeHead(302, { Location: "/" });
  }
  res.end();
});
const port = process.env.PORT || 3000;
server.listen(port);

console.log(`Server is running on port ${port}`);
