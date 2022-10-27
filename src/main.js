import * as path from 'path'
import colors from 'picocolors'
import json from '../package.json'
import { mergeConfig } from 'vite'
import resolveConfig from './lib/resolveConfig'

/**
 * Retrieve a relative path to the entrypoint.
 * 
 * @param  object  config
 * @param  string  subpath
 * @return string|false
 */
const relativeToEntrypoint = (config, subpath) => {
  if (! config?.paths?.entrypoint) {
    return false
  }

  return path.relative(process.cwd(), path.join(config.paths.entrypoint, subpath))
}

/**
 * Retrieve a relative path to the docker services.
 * 
 * @param  object  config
 * @param  string  subpath
 * @return string|false
 */
const relativeToDocker = (config, subpath) => {
  if (! config?.paths?.docker) {
    return false
  }

  return path.relative(process.cwd(), path.join(config.paths.docker, subpath))
}

/**
 * Retrieve a relative path to the codo project.
 * 
 * @param  object  config
 * @param  string  subpath
 * @return string
 */
const relativeToCodo = (config, subpath) => {
  const base = path.dirname(config.file)

  return path.relative(process.cwd(), path.join(base, subpath))
}

/**
 * Resolve the Codo Vite plugin.
 * 
 * @param  object  codo
 * @param  object  options
 * @return object
 */
const resolvePlugin = (config, options) => {
  options = mergeConfig({
    domain: null,
    port: 5173,
    https: {
      public: null,
      private: null,
    },
  }, options)

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

      if (options.domain) {
        server = mergeConfig({
          host: '0.0.0.0',
          port: options.port,
          strictPort: true,
          hmr: {
            port: options.port,
            clientPort: options.port,
            host: options.domain,
          }
        }, server)
      }

      if (options.https.public && options.https.private) {
        server = mergeConfig({
          https: {
            cert: relativeToCodo(config, options.https.public),
            key: relativeToCodo(config, options.https.private),
          }
        }, server)
      }

      let build = mergeConfig({
        manifest: true,
        emptyOutDir: true,
      }, userConfig?.build || {})

      return {
        ...userConfig, server, build,
        envDir: config.paths.entrypoint,
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
          server.config.logger.info(`\n  ${colors.red(`${colors.bold('CODO')} v${json.version}`)}  ${colors.dim(colors.bold(`${config.project.name}`))}`)
          server.config.logger.info('')
          server.config.logger.info(`  ${colors.green('➜')}  ${colors.bold('Config')}: ${colors.cyan(config.file)}`)
          server.config.logger.info(`  ${colors.green('➜')}  ${colors.bold('Application')}: ${colors.cyan(config.paths.entrypoint)}`)
          server.config.logger.info(`  ${colors.green('➜')}  ${colors.bold('Environment')}: ${colors.cyan(config.project.environment)}`)
        })
      })
    },

  }
}

export const resolveCodo = (filepath) => {
  const config = resolveConfig(filepath)

  return {
    plugin: (options) => resolvePlugin(config, options),
    relativeToEntrypoint: (subpath) => relativeToEntrypoint(config, subpath),
    relativeToDocker: (subpath) => relativeToDocker(config, subpath),
    relativeToCodo: (subpath) => relativeToCodo(config, subpath),
    ...config,
  }
}
