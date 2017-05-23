# createrest

Declare your routes

Docs at https://atomixinteractions.github.io/createrest


## Warning!

> Now in development! Use in production only after v1 release!


## Usage example

```js
import {
  createRest,
  printRoutes,
} from 'createrest'
import expressMiddleware from 'createrest-express'
import express from 'express'

const app = express()

function before1() { console.log('before1()') }
function before2() { console.log('before2()') }
function before3() { console.log('before3()') }
function after1() { console.log('after1()') }
function after2() { console.log('after2()') }
function after3() { console.log('after3()') }
function post1() { console.log('post1()') }
function get1() { console.log('get1()') }
function get2() { console.log('get2()') }
function put3() { console.log('put3()') }

const routes = createRest(e => {
  e.before(before1)
  e.after(after1)

  e.post('/', post1)

  e.scope('demo', e => {
    e.before(before2)
    e.after(after2)

    e.get('/', get1)
    e.get('/foo', get2)

    e.scope('bar', e => {
      e.before(before3)
      e.after(after3)

      e.put('/', put3)
    })
  })
})

app.use(expressMiddleware(routes))

app.listen(4001, () => {
  printRoutes(routes)
})
```


## CLI

```bash
rest               # Show man page
rest init          # Create main files
rest routes        # Show routes
```

or with alias: `createrest`
