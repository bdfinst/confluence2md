import {
  buildFrontmatter,
  formatMarkdown,
  readDirRecursive,
} from '../src/utilities.js'

it('should return an error if the `from` path is not a directory', () => {
  const path = './NO_PATH'
  expect(() => {
    readDirRecursive(path)
  }).toThrow()
})

it('should add frontmatter with title and type property', () => {
  const title = '# Page Title'
  const result = buildFrontmatter(title)
  const expected = '---\ntitle: "Page Title"\ntype: docs\n---\n'

  expect(result).toEqual(expected)
})

it('should return an empty string if there is an empty title', () => {
  const title = ''
  const result = buildFrontmatter(title)
  const expected = ''
  expect(result).toEqual(expected)
})

it('should return an empty string if there is no title', () => {
  const title = undefined
  const result = buildFrontmatter(title)
  const expected = ''
  expect(result).toEqual(expected)
})

it('should add frontmatter if the `-f` flag is given', () => {
  const text =
    '# Postmortem 2021-11-01\n\n# Summary\n\nOn Friday 10/31 a planned outage occurred at 7:30 AM Central time to'

  const result = formatMarkdown(text, true).split('---')
  expect(result[1]).toEqual('\ntitle: "Postmortem 2021-11-01"\ntype: docs\n')
})

it('should exclude frontmatter if the `-f` flag is not given', () => {
  const text =
    '# Postmortem 2021-11-01\n\n# Summary\n\nOn Friday 10/31 a planned outage occurred at 7:30 AM Central time to'

  const result = formatMarkdown(text, false).split('#')
  expect(result[1]).toEqual(' Postmortem 2021-11-01\n\n')
})
