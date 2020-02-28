const fs = require("fs");
const Path = require("path");
const mime = require("mime-types");

function isHTML(path) {
  return (
    /(.htm|.html)$/.test(path) ||
    !path
      .split("/")
      .pop()
      .match(/\.[a-zA-Z]*$/)
  );
}

function isStatic(path) {
  return /(.js|.css|.json|.ico|.jpg|.png)$/.test(path);
}

const HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#000000"/><meta name="description" content="Web site created using create-react-app"/><link rel="apple-touch-icon" href="/logo192.png"/><link rel="manifest" href="/manifest.json"/><title>QuoteBoard</title><link href="/static/css/2.fc331815.chunk.css" rel="stylesheet"></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div><script>!function(f){function e(e){for(var r,t,n=e[0],o=e[1],u=e[2],l=0,a=[];l<n.length;l++)t=n[l],Object.prototype.hasOwnProperty.call(p,t)&&p[t]&&a.push(p[t][0]),p[t]=0;for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(f[r]=o[r]);for(s&&s(e);a.length;)a.shift()();return c.push.apply(c,u||[]),i()}function i(){for(var e,r=0;r<c.length;r++){for(var t=c[r],n=!0,o=1;o<t.length;o++){var u=t[o];0!==p[u]&&(n=!1)}n&&(c.splice(r--,1),e=l(l.s=t[0]))}return e}var t={},p={1:0},c=[];function l(e){if(t[e])return t[e].exports;var r=t[e]={i:e,l:!1,exports:{}};return f[e].call(r.exports,r,r.exports,l),r.l=!0,r.exports}l.m=f,l.c=t,l.d=function(e,r,t){l.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},l.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(r,e){if(1&e&&(r=l(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var t=Object.create(null);if(l.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var n in r)l.d(t,n,function(e){return r[e]}.bind(null,n));return t},l.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return l.d(r,"a",r),r},l.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},l.p="/";var r=this["webpackJsonpquote-board"]=this["webpackJsonpquote-board"]||[],n=r.push.bind(r);r.push=e,r=r.slice();for(var o=0;o<r.length;o++)e(r[o]);var s=n;i()}([])</script><script src="/static/js/2.4b391c9f.chunk.js"></script><script src="/static/js/main.586c0366.chunk.js"></script></body></html>`;

const koaHTML = ({ strapi }) => async (ctx, next) => {
  if (ctx.method.toUpperCase() !== "GET") return next();
  if (ctx.accepts("html") != "html") return next();

  if (!isHTML(ctx.path) && !isStatic(ctx.path)) {
    return next();
  }

  const {
    server,
    response: {
      html: { serverOrigin }
    }
  } = strapi.config.currentEnvironment;

  const origin = ctx.get("Origin") || ctx.origin;
  if (!serverOrigin.includes(origin)) {
    return next();
  }

  if (isStatic(ctx.path)) {
    const publicPath = server.public.path;
    ctx.set("Content-Type", mime.contentType(Path.extname(ctx.path)));
    ctx.set("Cache-Control", `max-age=${4 * 7 * 24 * 3600}`);

    ctx.body = fs.createReadStream(
      Path.resolve(publicPath, Path.join(".", ctx.path))
    );
  } else {
    ctx.set("Content-Type", "text/html");
    ctx.send(HTML);
  }
};

module.exports = strapi => ({
  initialize() {
    strapi.app.use(koaHTML({ strapi }));
  }
});
