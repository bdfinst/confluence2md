import { convert, getPages } from '../src/fileHandler'

it('should return an error if the `from` path is not a directory', () => {
  const path = './NO_PATH'
  expect(() => {
    getPages(path)
  }).toThrow()
})

it('should return a list of HTML files if it is a valid path', () => {
  const path = 'test/assets/page1'
  const files = getPages(path)

  expect(Array.isArray(files)).toEqual(true)
  expect(files).toHaveLength(5)
})

it('should return a converted page', () => {
  const path = 'test/assets/remote-image.html'
  const files = convert(path)

  expect(files).toHaveLength(5)
})
