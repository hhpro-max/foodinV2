require('dotenv').config({ path: './backend/.env' });
const sequelize = require('../src/config/sequelize');

// Import all models
const models = require('../src/models/index');
const Role = require('../src/models/role.model');
const Permission = require('../src/models/permission.model');
const RolePermission = require('../src/models/role_permission.model');
const Category = require('../src/models/category.model');
const Tag = require('../src/models/tag.model');
const User = require('../src/models/user.model');
const Profile = require('../src/models/profile.model');
const UserRole = require('../src/models/user_role.model');

const seedData = {
  roles: [
    { name: 'admin', description: 'System administrator with full access' },
    { name: 'seller', description: 'Product seller/supplier' },
    { name: 'buyer', description: 'Product buyer/customer' },
    { name: 'support', description: 'Customer support representative' },
  ],

  permissions: [
    // User management
    { codename: 'user.view', name: 'View Users', description: 'Can view user information' },
    { codename: 'user.create', name: 'Create Users', description: 'Can create new users' },
    { codename: 'user.update', name: 'Update Users', description: 'Can update user information' },
    { codename: 'user.delete', name: 'Delete Users', description: 'Can delete users' },
    { codename: 'user.manage_roles', name: 'Manage User Roles', description: 'Can assign/remove user roles' },

    // Product management
    { codename: 'product.view', name: 'View Products', description: 'Can view product information' },
    { codename: 'product.create', name: 'Create Products', description: 'Can create new products' },
    { codename: 'product.update', name: 'Update Products', description: 'Can update product information' },
    { codename: 'product.delete', name: 'Delete Products', description: 'Can delete products' },
    { codename: 'product.approve', name: 'Approve Products', description: 'Can approve/reject products' },
    { codename: 'product.view_all', name: 'View All Products', description: 'Can view all products regardless of seller' },

    // Invoice management
    { codename: 'invoice.view', name: 'View Invoices', description: 'Can view invoice information' },
    { codename: 'invoice.create', name: 'Create Invoices', description: 'Can create new invoices' },
    { codename: 'invoice.update', name: 'Update Invoices', description: 'Can update invoice information' },
    { codename: 'invoice.delete', name: 'Delete Invoices', description: 'Can delete invoices' },
    { codename: 'invoice.view_all', name: 'View All Invoices', description: 'Can view all invoices' },

    // Payment management
    { codename: 'payment.view', name: 'View Payments', description: 'Can view payment information' },
    { codename: 'payment.process', name: 'Process Payments', description: 'Can process payments' },
    { codename: 'payment.refund', name: 'Refund Payments', description: 'Can process refunds' },

    // Category management
    { codename: 'category.view', name: 'View Categories', description: 'Can view categories' },
    { codename: 'category.create', name: 'Create Categories', description: 'Can create new categories' },
    { codename: 'category.update', name: 'Update Categories', description: 'Can update categories' },
    { codename: 'category.delete', name: 'Delete Categories', description: 'Can delete categories' },

    // Notification management
    { codename: 'notification.view', name: 'View Notifications', description: 'Can view notifications' },
    { codename: 'notification.send', name: 'Send Notifications', description: 'Can send notifications' },
    { codename: 'notification.manage', name: 'Manage Notifications', description: 'Can manage all notifications' },

    // Report access
    { codename: 'report.sales', name: 'Sales Reports', description: 'Can view sales reports' },
    { codename: 'report.financial', name: 'Financial Reports', description: 'Can view financial reports' },
    { codename: 'report.user_activity', name: 'User Activity Reports', description: 'Can view user activity reports' },

    // System management
    { codename: 'system.settings', name: 'System Settings', description: 'Can manage system settings' },
    { codename: 'system.logs', name: 'System Logs', description: 'Can view system logs' },
  ],

  rolePermissions: {
    admin: [
      'user.view', 'user.create', 'user.update', 'user.delete', 'user.manage_roles',
      'product.view', 'product.create', 'product.update', 'product.delete', 'product.approve', 'product.view_all',
      'invoice.view', 'invoice.create', 'invoice.update', 'invoice.delete', 'invoice.view_all',
      'payment.view', 'payment.process', 'payment.refund',
      'category.view', 'category.create', 'category.update', 'category.delete',
      'notification.view', 'notification.send', 'notification.manage',
      'report.sales', 'report.financial', 'report.user_activity',
      'system.settings', 'system.logs'
    ],
    seller: [
      'product.view', 'product.create', 'product.update',
      'invoice.view', 'invoice.create',
      'payment.view',
      'category.view',
      'notification.view',
      'report.sales'
    ],
    buyer: [
      'product.view',
      'invoice.view',
      'payment.view',
      'category.view',
      'notification.view'
    ],
    support: [
      'user.view', 'user.update',
      'product.view', 'product.view_all',
      'invoice.view', 'invoice.view_all',
      'payment.view',
      'category.view',
      'notification.view', 'notification.send',
      'report.user_activity'
    ]
  },

  categories: [
    { name: 'Fruits & Vegetables', description: 'Fresh fruits and vegetables' },
    { name: 'Dairy & Eggs', description: 'Milk, cheese, yogurt, and eggs' },
    { name: 'Meat & Poultry', description: 'Fresh and frozen meat and poultry' },
    { name: 'Seafood', description: 'Fresh and frozen seafood' },
    { name: 'Bakery', description: 'Bread, pastries, and baked goods' },
    { name: 'Pantry Staples', description: 'Rice, pasta, oils, and cooking essentials' },
    { name: 'Snacks & Confectionery', description: 'Chips, nuts, candies, and sweets' },
    { name: 'Beverages', description: 'Juices, soft drinks, and beverages' },
    { name: 'Frozen Foods', description: 'Frozen meals and ingredients' },
    { name: 'Spices & Seasonings', description: 'Herbs, spices, and seasonings' },
    { name: 'Canned & Packaged', description: 'Canned goods and packaged foods' },
    { name: 'Health & Organic', description: 'Organic and health-focused products' },
  ],

  tags: [
    { name: 'Organic', color: '#22c55e' },
    { name: 'Fresh', color: '#3b82f6' },
    { name: 'Local', color: '#f59e0b' },
    { name: 'Premium', color: '#8b5cf6' },
    { name: 'Bulk', color: '#ef4444' },
    { name: 'Seasonal', color: '#06b6d4' },
    { name: 'Imported', color: '#f97316' },
    { name: 'Halal', color: '#10b981' },
    { name: 'Gluten-Free', color: '#84cc16' },
    { name: 'Vegan', color: '#22c55e' },
  ],
};

async function seedDatabase(options = {}) {
  const { closeConnection = true } = options;
  try {
    console.log('🌱 Starting database seeding...');
    
    // Sync all models
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Seed roles
    console.log('Seeding roles...');
    const roleIds = {};
    for (const role of seedData.roles) {
      const [roleInstance, created] = await Role.findOrCreate({
        where: { name: role.name },
        defaults: role
      });
      roleIds[role.name] = roleInstance.id;
      if (created) {
        console.log(`  Created role: ${role.name}`);
      } else {
        console.log(`  Role already exists: ${role.name}`);
      }
    }

    // Seed permissions
    console.log('Seeding permissions...');
    const permissionIds = {};
    for (const permission of seedData.permissions) {
      const [permissionInstance, created] = await Permission.findOrCreate({
        where: { codename: permission.codename },
        defaults: permission
      });
      permissionIds[permission.codename] = permissionInstance.id;
      if (created) {
        console.log(`  Created permission: ${permission.codename}`);
      } else {
        console.log(`  Permission already exists: ${permission.codename}`);
      }
    }

    // Seed role permissions
    console.log('Seeding role permissions...');
    for (const [roleName, permissions] of Object.entries(seedData.rolePermissions)) {
      const roleId = roleIds[roleName];
      
      // Clear existing permissions for this role
      await RolePermission.destroy({ where: { roleId } });
      
      // Add new permissions
      for (const permissionCodename of permissions) {
        const permissionId = permissionIds[permissionCodename];
        if (permissionId) {
          await RolePermission.findOrCreate({
            where: { roleId, permissionId },
            defaults: { roleId, permissionId }
          });
        }
      }
      console.log(`  Updated permissions for role: ${roleName}`);
    }

    // Seed categories
    console.log('Seeding categories...');
    for (const category of seedData.categories) {
      const [categoryInstance, created] = await Category.findOrCreate({
        where: { name: category.name },
        defaults: category
      });
      if (created) {
        console.log(`  Created category: ${category.name}`);
      } else {
        console.log(`  Category already exists: ${category.name}`);
      }
    }

    // Seed tags
    console.log('Seeding tags...');
    for (const tag of seedData.tags) {
      const [tagInstance, created] = await Tag.findOrCreate({
        where: { name: tag.name },
        defaults: tag
      });
      if (created) {
        console.log(`  Created tag: ${tag.name}`);
      } else {
        console.log(`  Tag already exists: ${tag.name}`);
      }
    }

    // Create default admin user if not exists
    console.log('Creating default admin user...');
    const adminPhone = '+989123456789';
    const [adminUser, userCreated] = await User.findOrCreate({
      where: { phone: adminPhone },
      defaults: {
        phone: adminPhone,
        userType: 'natural',
        isActive: true,
        isVerified: true
      }
    });

    if (userCreated) {
      // Create profile for admin
      await Profile.findOrCreate({
        where: { userId: adminUser.id },
        defaults: {
          userId: adminUser.id,
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@foodin.com',
          customerCode: 'ADMIN001'
        }
      });

      // Assign admin role
      await UserRole.findOrCreate({
        where: { userId: adminUser.id, roleId: roleIds.admin },
        defaults: { userId: adminUser.id, roleId: roleIds.admin }
      });

      console.log(`✅ Default admin user created with phone: ${adminPhone}`);
    } else {
      console.log('ℹ️  Default admin user already exists');
    }

    console.log('✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    if (closeConnection) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = { seedDatabase };