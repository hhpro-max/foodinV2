const BaseRepository = require('./base.repository');
const { User, Role, Permission } = require('../models');

class UserRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, User);
  }

  async findByPhone(phone) {
    return await this.findOne({ phone });
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findWithProfile(id) {
    return await this.findById(id, {
      include: ['profile', 'naturalPerson', 'legalPerson'],
    });
  }

  async findByRole(roleName) {
    return this.model.findOne({
      include: [
        {
          model: Role,
          as: 'roles',
          where: { name: roleName },
        },
      ],
    });
  }

  async findWithRoles(id) {
    return await this.findById(id, {
      include: ['roles'],
    });
  }

  async getRoles(userId) {
    const user = await this.findWithRoles(userId);
    return user ? user.roles : [];
  }

  async getUserPermissions(id) {
    const user = await this.findById(id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) return [];

    const permissions = user.roles.flatMap(role =>
      role.permissions.map(permission => permission.codename)
    );

    return [...new Set(permissions)]; // Return unique permissions
  }

  async activateUser(id) {
    return await this.update(id, { isActive: true });
  }

  async deactivateUser(id) {
    return await this.update(id, { isActive: false });
  }

  async findActiveUsers() {
    return await this.findAll({ isActive: true });
  }

  async findInactiveUsers() {
    return await this.findAll({ isActive: false });
  }
}

module.exports = UserRepository;