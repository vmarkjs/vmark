import { it, expect } from 'vitest'
import vmarkPlugin from '../src'

it('should transform markdown', async () => {
  const plugin = vmarkPlugin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (<any>plugin).transform('# heading', 'test.md')
  expect(result?.toString()).toContain('h("h1"')
})
