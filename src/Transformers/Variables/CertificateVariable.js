export class CertificateVariable
{
  /**
   * Instantiate a new CertificateVariable object.
   * 
   * @param  string  publicKey
   * @param  string  privateKey
   * @return void
   */
  constructor (publicKey, privateKey) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  /**
   * Handle the transformation.
   * 
   * @param  string  variable
   * @return object
   */
  handle (variable) {
    return {
      [`${variable}_PUBLIC`]: this.publicKey,
      [`${variable}_PRIVATE`]: this.privateKey,
    }
  }
}

export default {
  tag: '!cert',
  identify: (value) => false,
  stringify (value) {
    return '"' + JSON.stringify(value).replace(/"/g, '\\"') + '"'
  },
  resolve (value, onError) {
    try {
      const data = JSON.parse(value)

      if (! data.public || ! data.private) {
        return onError(data, 'MISSING_CERT_KEY', 'Missing either the public or private certificate keys.')
      }

      return new CertificateVariable(data.public, data.private)
    } catch (e) {
      return value
    }
  }
}
