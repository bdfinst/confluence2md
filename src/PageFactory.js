/* eslint-disable no-var */

import Page from './Page'

class PageFactory {
  create(fullPath) {
    this.fullPath = fullPath
    return new Page(this.fullPath)
  }
}

export default PageFactory
