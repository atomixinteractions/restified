/* eslint-disable import/no-extraneous-dependencies, no-unused-vars, no-console */
/* eslint-disable unicorn/prefer-starts-ends-with */
const stringify = require('stringify-object')
const chalk = require('chalk')

const { createRest, flattenRoutes, printRoutes } = require('../dist')

/**
 *      ''
 *  '/foo'
 *
 *         'some'
 *  '/foo/some
 */

const exampleAT = {
  demo: {
    before: [],
    after: [],
    methods: {
      POST: [() => {}],
      PUT: [],
    },
    scoped: {
      foo: {
        before: [() => {}],
        after: [],
        methods: {
          POST: [() => {}],
          PUT: [],
        },
      },
    },
  },
}

// ========================================================================= //
// ========================================================================= //

const TestsController = {
  beforeEach() {},
  afterEach() {},
  index() {},
  read() {},
  create() {},
  update() {},
  patch() {},
  destroy() {},
}

const before1 = function before1() {
  console.log('before1()')
}
const before2 = function before2() {
  console.log('before2()')
}
const before3 = function before3() {
  console.log('before3()')
}
const after1 = function after1() {
  console.log('after1()')
}
const after2 = function after2() {
  console.log('after2()')
}
const after3 = function after3() {
  console.log('after3()')
}
const post1 = function post1() {
  console.log('post1()')
}
const get1 = function get1() {
  console.log('get1()')
}
const get2 = function get2() {
  console.log('get2()')
}
const get3 = function get3() {
  console.log('get3()')
}
const put3 = function put3() {
  console.log('put3()')
}

const routes = createRest((root) => {
  // root.beforeEach(before1)
  // root.afterEach(after1)

  // root.post('/', post1)

  // root.scope('demo', (demo) => {
  // demo.crud('bar', TestsController, {}, bar => {
  //   bar.get('baz', get3)
  // })
  // demo.get('bar', get3)
  // })
  // root.scope('demo', (demo) => {
  //   demo.get('baz', get2)
  // })
  root.resources('tests', TestsController, (tests) => {
    tests.get('/status', get1)

    tests.scope(':testId', (testId) => {
      testId.get('description', get2)
    })
  })
})

const strf = (data, indent = '  ') => stringify(data, {
  indent,
  transform(obj, prop, original) {
    if (/^function/.test(original)) {
      return chalk.blue(original
        .replace(/\n+/mg, '')
        .replace(/\s+/mg, ' ')
        .replace(/^\w+\s+(\w+)\(\).*/mg, '$1()'))
    }

    return original
  },
})

console.log(strf(routes))

const flat = flattenRoutes(routes)

Object.keys(flat).forEach((path) => {
  const mt = flat[path]

  Object.keys(mt).forEach((method) => {
    console.log(
      chalk.green(`${method} ${path}`),
      ' >> ',
      mt[method].map((fn) => `${chalk.yellow(fn.name)}()`).join(', ')
    )
  })
})

console.log('\n---\n')

printRoutes(routes)
