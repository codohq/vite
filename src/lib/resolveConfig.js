import yaml from 'yaml'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Resolve the Codo configuration file.
 * 
 * @param  string  projectPath
 * @param  string  configFile
 * @return object
 */
const resolveConfig = (filepath) => {
  path.isAbsolute(filepath) || (filepath = path.join(process.cwd(), filepath))

  const basepath = path.dirname(filepath)

  const file = fs.readFileSync(filepath, 'utf8')
  const config = yaml.parse(file)

  return {
    ...config,
    codo: {
      file: fs.realpathSync(filepath),
      paths: {
        docker:     path.join(basepath, config.codo.components.docker),
        entrypoint: path.join(basepath, config.codo.components.entrypoint),
        framework:  path.join(basepath, config.codo.components.framework),
        theme:      path.join(basepath, config.codo.components.theme),
      },
      project: {
        name: config.settings.name,
        environment: config.settings.environment,
      }
    }
  }
}

export default resolveConfig
