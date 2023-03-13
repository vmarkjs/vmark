import { Plugin, Processor, unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import { matter } from 'vfile-matter'
import remarkGFM from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { toH } from 'hast-to-hyperscript'

type CreateElement<T = object> = (
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any[],
) => T

function matterPlugin(): Plugin {
  return (_, file) => {
    matter(file)
  }
}

// let's ignore typescript for this plugin
function rehypeHyperscript(this: unknown, options: { h: CreateElement }) {
  function compiler(node: never) {
    return toH(options.h, node)
  }
  Object.assign(this as never, { Compiler: compiler })
}

export default class VMarkRenderer<TResult extends object> {
  private processor: Processor

  constructor(options: { h: CreateElement<TResult>; sanitize?: boolean }) {
    this.processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(matterPlugin as never)
      .use(remarkMath)
      .use(remarkGFM)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeKatex)
      .use(rehypeRaw)

    if (options.sanitize !== false) {
      this.processor.use(rehypeSanitize)
    }

    this.processor.use(rehypeHyperscript, { h: options.h })
  }

  async render(md: string) {
    const { result, data } = await this.processor.process(md)
    return {
      result: result as TResult,
      frontmatter: data.matter as Record<string, unknown> | undefined,
    }
  }
}
