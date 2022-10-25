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
        docker:     config?.codo?.components?.docker ? path.join(basepath, config.codo.components.docker) : null,
        entrypoint: config?.codo?.components?.entrypoint ? path.join(basepath, config.codo.components.entrypoint) : null,
        // framework:  config?.codo?.components?.framework ? path.join(basepath, config.codo.components.framework) : null,
        // theme:      config?.codo?.components?.theme ? path.join(basepath, config.codo.components.theme) : null,
      },
      project: {
        name: config.settings.name,
        environment: config.settings.environment,
      }
    }
  }
}

export default resolveConfig
