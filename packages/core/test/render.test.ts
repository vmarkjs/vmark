import { it, expect } from 'vitest'
import VMarkRenderer from '../src'

it('should render markdown as text', async () => {
  const renderer = new VMarkRenderer({
    h(name, attr, children) {
      return {
        text: `h("${name}",${JSON.stringify(attr)},[${
          children ? children.map((c) => c.text || JSON.stringify(c)) : ''
        }])`,
      }
    },
    sanitize: false,
  })

  // basic rendering
  let { result } = await renderer.render('# heading')
  expect(result.text).toBe(`h("h1",{},["heading"])`)

  // inline html
  result = (
    await renderer.render(
      '# heading\n<div class="container"><span>test</span></div>',
    )
  ).result
  expect(result.text).toBe(
    'h("div",{},[h("h1",{},["heading"]),"\\n",h("div",{"class":"container"},[h("span",{},["test"])])])',
  )

  const rendererSanitized = new VMarkRenderer({
    h(name, attr, children) {
      return {
        text: `h("${name}",${JSON.stringify(attr)},[${
          children ? children.map((c) => c.text || JSON.stringify(c)) : ''
        }])`,
      }
    },
  })
  // sanitized html
  result = (
    await rendererSanitized.render(
      '# heading\n<div class="container"></div><script>test</script>',
    )
  ).result
  expect(result.text).toBe(
    'h("div",{},[h("h1",{},["heading"]),"\\n",h("div",{},[])])',
  )
})

it('should parse frontmatter', async () => {
  const renderer = new VMarkRenderer({
    h(name, attr, children) {
      return {
        text: `h("${name}",${JSON.stringify(attr)},[${
          children ? children.map((c) => c.text || JSON.stringify(c)) : ''
        }])`,
      }
    },
    sanitize: false,
  })

  // basic rendering
  const { result, frontmatter } = await renderer.render(
    '---\ntitle: test\n---\n# heading',
  )
  expect(result.text).toBe(`h("h1",{},["heading"])`)
  expect(frontmatter).toStrictEqual({ title: 'test' })
})
