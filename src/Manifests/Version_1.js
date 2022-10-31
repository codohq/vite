import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'yaml'

const environmentVariables = (globalVariables, envVariables) => {
  let variables = {}

  if (globalVariables) {
    Object.entries(globalVariables).forEach(([name, value]) => {
      if (value.handle && typeof value.handle === 'function') {
        variables = { ...variables, ...value.handle(name) }
        return
      }

      variables[name] = value
      return
    })
  }

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
    env: config.codo.environment,
    file: fs.realpathSync(filepath),
    paths: {
      docker: path.join(basepath, config.codo.docker),
      entrypoint: path.join(basepath, environment.entrypoint),
    },
    project: {
      ...environment,
      name: config.codo.name,
      environment: config.codo.environment,
      environmentVariables: environmentVariables(config.codo?.variables, environment.variables),
    },
  }
}
