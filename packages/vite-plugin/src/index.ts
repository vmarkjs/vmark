import VMarkRenderer from '@vmark/core'
import hash from 'hash-sum'
import type { Plugin } from 'vite'

const mdRegex = /\.md$/

export default function plugin(): Plugin {
  const renderer = new VMarkRenderer({
    h(name, attr, children) {
      return {
        text: `h("${name}", ${JSON.stringify(attr)}, [${
          children
            ?.filter((c) => c !== '\n')
            .map((c) => c.text || JSON.stringify(c)) || ''
        }])`,
      }
    },
    sanitize: false,
  })
  return {
    name: '@vmark/vite-plugin',
    async transform(src, id) {
      if (!mdRegex.test(id)) {
        return
      }

      let code = `import { h } from "vue";`
      const { result, frontmatter } = await renderer.render(src)
      code += `\nexport const nodes = ${result.text};`
      code += `\nexport const frontmatter = ${JSON.stringify(frontmatter)};`

      // handle hmr
      code += `\nconst _default = { render() { return nodes } }`
      code += `\n_default.__hmrId = '${hash(id)}'`
      code += `\n_default.__file = '${id}'`
      code += `\nif (typeof __VUE_HMR_RUNTIME__ !== 'undefined') {
  __VUE_HMR_RUNTIME__.createRecord(_default.__hmrId, _default)
}
if (import.meta.hot) {
  import.meta.hot.accept(({ default: _default }) => { __VUE_HMR_RUNTIME__.rerender(_default.__hmrId, _default.render) })
}`
      code += `\nexport default _default`
      return code
    },
  }
}
