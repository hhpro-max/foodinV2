const fs = require('fs');
const path = require('path');
const sequelize = require('../config/sequelize');

const db = {};
const modelsDir = __dirname;

fs.readdirSync(modelsDir)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(modelsDir, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

// Associations
const {
  User,
  Profile,
  Address,
  Product,
  Category,
  Cart,
  CartItem,
  Invoice,
  InvoiceItem,
  Order,
  OrderItem,
  Role,
  Permission,
  RolePermission,
  UserRole,
  Tag,
  ProductTag,
  ProductImage,
  ProductApproval,
  NaturalPerson,
  LegalPerson,
} = db;

// User associations
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
User.hasMany(Product, { foreignKey: 'sellerId', as: 'sellerProducts' });
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
User.hasMany(Invoice, { foreignKey: 'buyerId', as: 'buyerInvoices' });
User.hasMany(Invoice, { foreignKey: 'sellerId', as: 'sellerInvoices' });
User.hasMany(Order, { foreignKey: 'buyerId', as: 'orders' });
User.hasOne(NaturalPerson, { foreignKey: 'userId', as: 'naturalPerson' });
User.hasOne(LegalPerson, { foreignKey: 'userId', as: 'legalPerson' });

// Profile associations
Profile.belongsTo(User, { foreignKey: 'userId', as: 'profileUser' });

// Address associations
Address.belongsTo(User, { foreignKey: 'userId', as: 'addressUser' });

// Product associations
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
Product.hasMany(ProductApproval, { foreignKey: 'productId', as: 'approvals' });
Product.belongsToMany(Tag, { through: ProductTag, foreignKey: 'productId', as: 'tags' });

// Category associations
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId', as: 'cartUser' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });

// CartItem associations
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Invoice associations
Invoice.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Invoice.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });

// InvoiceItem associations
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order associations
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Role associations
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', as: 'permissions' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', as: 'users' });

// Permission associations
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', as: 'roles' });

// UserRole associations
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', as: 'roles' });

// Tag associations
Tag.belongsToMany(Product, { through: ProductTag, foreignKey: 'tagId', as: 'products' });

module.exports = db;