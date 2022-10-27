import * as fs from 'fs'
import * as path from 'path'
import { parseDocument } from 'yaml'
import useVersion1 from '../Manifests/Version_1.js'
import CertificateVariable from '../Transformers/Variables/CertificateVariable.js'

/**
 * Resolve the Codo configuration file.
 * 
 * @param  string  projectPath
 * @param  string  configFile
 * @return object
 */
const resolveConfig = (filepath) => {
  path.isAbsolute(filepath) || (filepath = path.join(process.cwd(), filepath))

  const options = {
    strict: false,
    customTags: [CertificateVariable],
  }

  const file = fs.readFileSync(filepath, 'utf8')
  const doc = parseDocument(file, options)

  switch (doc.get('version')) {
    case 1:
      return useVersion1(filepath, doc.toString(), options)

    default:
      throw new Error('Invalid manifest version (valid options are "1").')
  }
}

export default resolveConfig
