
class ServiceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ServiceError"; 
    }
  }

module.exports = ServiceError