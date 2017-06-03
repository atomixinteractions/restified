import avaTest from 'ava'
import { createRest, flattenRoutes } from '../lib'


const get = () => {}
const post = () => {}
const put = () => {}
const patch = () => {}
const destroy = () => {}
const before = () => {}
const after = () => {}

const make = (method, listeners = []) => ({
  method, listeners,
})

avaTest('Empty', test => {
  test.deepEqual(
    flattenRoutes(createRest(root => {
    })),
    {}
  )
})

avaTest('Local methods', test => {
  test.deepEqual(
    flattenRoutes(createRest(root => {
      root.get(get)
      root.post(post)
      root.put(put)
      root.patch(patch)
      root.delete(destroy)
    })),
    {
      '/': {
        GET: [get],
        POST: [post],
        PUT: [put],
        PATCH: [patch],
        DELETE: [destroy],
      }
    }
  )
})

avaTest('Local and scoped methods', test => {
  test.deepEqual(
    flattenRoutes(createRest(root => {
      root.get(get)
      root.post(post)
      root.get('/name', get)
      root.post('/name', post)
    })),
    {
      '/': {
        GET: [get],
        POST: [post],
      },
      '/name/': {
        GET: [get],
        POST: [post],
      },
    }
  )
})

avaTest('Local, scoped methods and methods in scope', test => {
  test.deepEqual(
    flattenRoutes(createRest(root => {
      root.get(get)
      root.post(post)
      root.get('/name', get)
      root.post('name', post)
      root.scope('foo', foo => {
        foo.get(get)
        foo.post('bar', post)
      })
      root.get(get)
      root.post('name', post)
    })),
    {
      '/': {
        GET: [get, get],
        POST: [post],
      },
      '/name/': {
        GET: [get],
        POST: [post, post],
      },
      '/foo/': {
        GET: [get],
      },
      '/foo/bar/': {
        POST: [post],
      },
    }
  )
})
