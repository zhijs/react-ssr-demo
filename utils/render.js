import React from 'react'
import { renderToString} from 'react-dom/server'
import { StaticRouter, matchPath } from 'react-router-dom'
import {Route} from 'react-router-dom'
import routers from '../routes'
import { Provider } from 'react-redux'
import store from '../redux/storeServer'

const render = (req, res) => {
  const matchRoutes = []
  const promises = []
  routers.some(route=> {
      matchPath(req.path, route) ? matchRoutes.push(route) : ''
  })
  matchRoutes.forEach( item=> {
      promises.push(item.loadData(store))
  })

  Promise.all(promises).then(() => {
    const content = renderToString(
      <Provider store={store}>
        <StaticRouter location={req.path} >
          <div>
            {
              routers.map(route => (
                <Route {...route} />
              ))
            }
          </div>
        </StaticRouter>
      </Provider>
    )


    // 响应请求内容 
    const result = `
      <html>
      <head>
        <title>hello</title>
      </head>
      <body>
        <div id="root">${content}</div>
        <script src="/index.js"></script>
        <script src="./socket.io.js"></script>
        <script>
          window.onload = function () {
            var socket = io.connect();
            socket.on('reload', function () {
              console.log('------- reload')
              window.location.reload();
            })
          }
        </script>
        <textarea style="display:none" id="ssr-initalState">${JSON.stringify(store.getState())}</textarea>
      </body>
      </html>
    `
    res.send(result)
  })
}

export default render