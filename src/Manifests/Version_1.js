import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'yaml'

const environmentVariables = (envVariables) => {
  let variables = {}

  Object.entries(envVariables).forEach(([name, value]) => {
    if (value.handle && typeof value.handle === 'function') {
      variables = { ...variables, ...value.handle(name) }
      return
    }

    variables[name] = value
    return
  })

  return variables
}

export default function (filepath, data, options) {
  const basepath = path.dirname(filepath)
  
  const config = parse(data, options)
  const environment = config.environments.find((x) => x.name === config.codo.environment)

  return {
    config,
    file: fs.realpathSync(filepath),
    paths: {
      docker: path.join(basepath, config.codo.docker),
      entrypoint: path.join(basepath, environment.entrypoint),
    },
    project: {
      ...environment,
      name: config.codo.name,
      environment: config.codo.environment,
      environmentVariables: environmentVariables(environment.environment),
    },
  }
}
