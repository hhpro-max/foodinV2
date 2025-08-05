const Permission = require('../models/permission.model');

class PermissionRepository {
  async findByName(name) {
    return await Permission.findOne({ where: { name } });
  }
}

module.exports = PermissionRepository;
