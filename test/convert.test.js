import { buildFrontmatter, readDirRecursive } from '../src/utilities.js'

it('should return an error if the `from` path is not a directory', () => {
  const path = './NO_PATH'
  expect(() => {
    readDirRecursive(path)
  }).toThrow()
})

it('should build frontmatter', () => {
  const title = '# P1H (Platform One - Holocron)'
  const result = buildFrontmatter(title)
  const expected = '---\ntitle: "P1H (Platform One - Holocron)"\n---\n'
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

// it('should return a list of HTML files if it is a valid path', () => {
//   const path = 'test/assets/page1'
//   const files = getPages(path)

//   expect(Array.isArray(files)).toEqual(true)
//   expect(files).toHaveLength(5)
// })

// it('should return a converted page', () => {
//   const path = 'test/assets/remote-image.html'
//   const files = convert(path)

//   expect(files).toHaveLength(5)
// })
