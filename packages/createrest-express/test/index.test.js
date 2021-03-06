import test from 'ava'
import supertest from 'supertest'
import sinon from 'sinon'
import { createRest } from 'createrest'
import { createExpressMiddleware } from '../lib'
import { createRawServer } from './utils'


const newSpy = () => ({
  get: sinon.stub().callsFake((req, res) => res.send({})),
  post: sinon.stub().callsFake((req, res) => res.send({})),
  patch: sinon.stub().callsFake((req, res) => res.send({})),
  put: sinon.stub().callsFake((req, res) => res.send({})),
  delete: sinon.stub().callsFake((req, res) => res.send({})),
  before: sinon.stub().callsFake((req, res, next) => next()),
  before2: sinon.stub().callsFake((req, res, next) => next()),
  before3: sinon.stub().callsFake((req, res, next) => next()),
  before4: sinon.stub().callsFake((req, res, next) => next()),
  after: sinon.stub().callsFake((req, res, next) => next()),
  after2: sinon.stub().callsFake((req, res, next) => next()),
  after3: sinon.stub().callsFake((req, res, next) => next()),
  after4: sinon.stub().callsFake((req, res, next) => next()),
})


test('/ get post put patch delete', async (t) => {
  t.plan(5)

  const spy = newSpy()
  const routes = (root) => {
    root.get('/', spy.get)
    root.post('/', spy.post)
    root.patch('/', spy.patch)
    root.put('/', spy.put)
    root.delete('/', spy.delete)
  }
  const server = createRawServer(routes)

  await supertest(server).get('/')
  t.true(spy.get.calledOnce)

  await supertest(server).post('/')
  t.true(spy.post.calledOnce)

  await supertest(server).patch('/')
  t.true(spy.patch.calledOnce)

  await supertest(server).put('/')
  t.true(spy.put.calledOnce)

  await supertest(server).delete('/')
  t.true(spy.delete.calledOnce)
})


test('deep path in simple handlers throws', async (t) => {
  t.throws(() => {
    createRest((root) => {
      root.get('/so/deep/path', () => { })
    })
  })
})

test('throws when passed not routes', async (t) => {
  t.throws(() => {
    createExpressMiddleware(() => { })
  }, TypeError)

  t.throws(() => {
    createExpressMiddleware({})
  }, TypeError)
})


test('deep scopes works', async (t) => {
  t.plan(5)

  const spy = newSpy()
  const routes = (root) => {
    root.scope('so', (so) => {
      so.scope('deep', (deep) => {
        deep.scope('path', (path) => {
          path.scope('for-you', (forYou) => {
            forYou.get('yea', spy.get)
            forYou.post('yea', spy.post)
            forYou.patch('yea', spy.patch)
            forYou.put('yea', spy.put)
            forYou.delete('yea', spy.delete)
          })
        })
      })
    })
  }
  const server = createRawServer(routes)

  await supertest(server).get('/so/deep/path/for-you/yea')
  t.true(spy.get.calledOnce)

  await supertest(server).post('/so/deep/path/for-you/yea')
  t.true(spy.post.calledOnce)

  await supertest(server).patch('/so/deep/path/for-you/yea')
  t.true(spy.patch.calledOnce)

  await supertest(server).put('/so/deep/path/for-you/yea')
  t.true(spy.put.calledOnce)

  await supertest(server).delete('/so/deep/path/for-you/yea')
  t.true(spy.delete.calledOnce)

  server.close()
})

test('before|after handler on root level', async (t) => {
  t.plan(4)
  const spy = newSpy()
  const routes = (root) => {
    root.beforeEach(spy.before)
    root.afterEach(spy.after)
    root.get('/', spy.get)
  }
  const server = createRawServer(routes)

  await supertest(server).get('/')

  t.true(spy.get.calledOnce)
  t.true(spy.before.calledBefore(spy.get))
  t.true(spy.before.calledBefore(spy.after))
  t.true(spy.get.calledBefore(spy.after))

  server.close()
})


test('before|after for deep handlers', async (t) => {
  t.plan(4)
  const spy = newSpy()
  const routes = (root) => {
    root.beforeEach(spy.before)
    root.afterEach(spy.after)
    root.scope('foo', (foo) => {
      foo.scope('bar', (bar) => {
        bar.scope('baz', (baz) => {
          baz.get('/', spy.get)
        })
      })
    })
  }
  const server = createRawServer(routes)

  await supertest(server).get('/foo/bar/baz')

  t.true(spy.get.calledOnce)
  t.true(spy.before.calledBefore(spy.get))
  t.true(spy.before.calledBefore(spy.after))
  t.true(spy.get.calledBefore(spy.after))

  server.close()
})


test('deep before|after for deep handlers', async (t) => {
  const spy = newSpy()
  const get = sinon.stub().callsFake((req, res, next) => next())

  const routes = (root) => {
    root.beforeEach(spy.before)
    root.afterEach(spy.after)

    root.scope('foo', (foo) => {
      foo.beforeEach(spy.before2)
      foo.afterEach(spy.after2)

      foo.scope('bar', (bar) => {
        bar.beforeEach(spy.before3)
        bar.afterEach(spy.after3)

        bar.scope('baz', (baz) => {
          baz.beforeEach(spy.before4)
          baz.afterEach(spy.after4)

          baz.get('/', get)
        })
      })
    })
  }
  const server = createRawServer(routes)

  await supertest(server).get('/foo/bar/baz')

  t.true(spy.before.calledBefore(spy.before2))
  t.true(spy.before2.calledBefore(spy.before3))
  t.true(spy.before3.calledBefore(spy.before4))

  t.true(spy.before4.calledBefore(get))
  t.true(get.calledOnce)
  t.true(spy.after4.calledAfter(get))

  t.true(spy.after3.calledAfter(spy.after4))
  t.true(spy.after2.calledAfter(spy.after3))
  t.true(spy.after.calledAfter(spy.after2))

  server.close()
})

