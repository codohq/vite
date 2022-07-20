import * as path from 'path'
import colors from 'picocolors'
import json from '../package.json'
import resolveConfig from './lib/resolveConfig'

/**
 * Retrieve a relative path to the entrypoint.
 * 
 * @param  object  config
 * @param  string  subpath
 * @return string
 */
const relativeToEntrypoint = (config, subpath) => {
  return path.relative(process.cwd(), path.join(config.codo.paths.entrypoint, subpath))
}

/**
 * Resolve the Codo Vite plugin.
 * 
 * @param  object  codo
 * @param  object  options
 * @return object
 */
const resolvePlugin = (config, options) => {
  return {
    name: 'codo:vite',
    enforce: 'pre',

    /**
     * Manipulate the Vite configuration.
     * 
     * @param  object  userConfig
     * @param  object  { command, mode }
     * @return object
     */
    config (userConfig, { command, mode }) {
      let server = userConfig?.server || {}

      if (! server?.host && config?.settings?.domain) {
        server.host = config.settings.domain
      }

      if (! server?.https && config?.settings?.certificates) {
        server.https = {
          key: path.normalize(config.codo.paths.entrypoint + '/' + config.settings.certificates.key),
          cert: path.normalize(config.codo.paths.entrypoint + '/' + config.settings.certificates.cert),
        }
      }

      let build = userConfig?.build || {}

      if (! build?.manifest) {
        build.manifest = true
      }

      if (! build?.emptyOutDir) {
        build.emptyOutDir = true
      }

      return {
        ...userConfig, server, build,
        envDir: config.codo.paths.entrypoint,
      }
    },

    /**
     * Configure the underlying HTTP dev server.
     * 
     * @param  object  server
     * @return void
     */
    async configureServer (server) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          server.config.logger.info(`\n  ${colors.red(`${colors.bold('CODO')} v${json.version}`)}  ${colors.dim(colors.bold(`${config.codo.project.name}`))}`)
          server.config.logger.info('')
          server.config.logger.info(`  ${colors.green('➜')}  ${colors.bold('Config')}: ${colors.cyan(config.codo.file)}`)
          server.config.logger.info(`  ${colors.green('➜')}  ${colors.bold('Application')}: ${colors.cyan(config.codo.paths.entrypoint)}`)
          server.config.logger.info(`  ${colors.green('➜')}  ${colors.bold('Environment')}: ${colors.cyan(config.codo.project.environment)}`)
        })
      })
    },

  }
}

export const resolveCodo = (filepath) => {
  const config = resolveConfig(filepath)

  return {
    config,
    plugin: (options) => resolvePlugin(config, options),
    relativeToEntrypoint: (subpath) => relativeToEntrypoint(config, subpath),
  }
}
