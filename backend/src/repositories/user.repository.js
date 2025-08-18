const BaseRepository = require('./base.repository');
const { User, Role, Permission, UserRole } = require('../models');

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
      include: [
        { model: this.sequelize.models.Profile, as: 'profile' },
        { model: this.sequelize.models.NaturalPerson, as: 'naturalPerson' },
        { model: this.sequelize.models.LegalPerson, as: 'legalPerson' },
        { model: this.sequelize.models.Role, as: 'roles', attributes: ['name'] },
      ],
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

  async findAllWithRoles(conditions = {}, orderBy = [['createdAt', 'DESC']], limit = null, offset = null) {
    return await this.model.findAll({
      where: conditions,
      order: orderBy,
      limit,
      offset,
      include: [
        { model: this.sequelize.models.Role, as: 'roles', attributes: ['name'] },
      ],
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

  async assignRole(userId, roleId) {
    // Check if the role is already assigned to avoid duplicates
    const existing = await UserRole.findOne({ where: { userId, roleId } });
    if (existing) {
      return existing; // Return the existing assignment
    }
    
    // Create new role assignment
    return await UserRole.create({ userId, roleId });
  }

  async removeRole(userId, roleId) {
    const result = await UserRole.destroy({ where: { userId, roleId } });
    return result > 0; // Return true if a role was removed, false otherwise
  }

  async findInactiveUsers() {
    return await this.findAll({ isActive: false });
  }
}

module.exports = UserRepository;