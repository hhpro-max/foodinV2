require('dotenv').config();
const { runMigrations } = require('./migrate');
const { seedDatabase } = require('./seed');

async function setupDatabase() {
  try {
    console.log('🚀 Starting Foodin Backend Setup...\n');
    
    console.log('📋 Setup Overview:');
    console.log('1. Run database migrations');
    console.log('2. Seed initial data');
    console.log('3. Verify setup\n');
    
    // Step 1: Run migrations
    console.log('📊 Step 1: Running database migrations...');
    await runMigrations();
    console.log('✅ Migrations completed successfully!\n');
    
    // Step 2: Seed database
    console.log('🌱 Step 2: Seeding database with initial data...');
    await seedDatabase();
    console.log('✅ Database seeded successfully!\n');
    
    // Step 3: Verify setup
    console.log('🔍 Step 3: Verifying setup...');
    await verifySetup();
    console.log('✅ Setup verification completed!\n');
    
    console.log('🎉 Foodin Backend Setup Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test API endpoints');
    console.log('3. Set up frontend application\n');
    
    console.log('🔗 Available API Endpoints:');
    console.log('- Authentication: POST /api/v1/auth/send-otp, /api/v1/auth/verify-otp');
    console.log('- Products: GET /api/v1/products');
    console.log('- Cart: GET /api/v1/cart (requires auth)');
    console.log('- Addresses: GET /api/v1/addresses (requires auth)');
    console.log('- Health Check: GET /health\n');
    
    console.log('👤 Default Admin Account:');
    console.log('Phone: +989123456789');
    console.log('Use any 6-digit OTP for development\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure PostgreSQL is running');
    console.error('2. Check DATABASE_URL in .env file');
    console.error('3. Verify database permissions');
    process.exit(1);
  }
}

async function verifySetup() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/foodin',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Check tables exist
    const { rows: tables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const expectedTables = [
      'users', 'profiles', 'natural_persons', 'legal_persons',
      'roles', 'permissions', 'role_permissions', 'user_roles',
      'addresses', 'categories', 'tags', 'products', 'product_images',
      'product_tags', 'product_approvals', 'promo_codes',
      'carts', 'cart_items', 'invoices', 'invoice_items',
      'payments', 'delivery_confirmations', 'notifications', 'otp_codes'
    ];
    
    const existingTables = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }
    
    console.log(`   ✓ All ${expectedTables.length} tables created successfully`);
    
    // Check roles and permissions
    const { rows: roles } = await pool.query('SELECT COUNT(*) as count FROM roles');
    const { rows: permissions } = await pool.query('SELECT COUNT(*) as count FROM permissions');
    const { rows: categories } = await pool.query('SELECT COUNT(*) as count FROM categories');
    
    console.log(`   ✓ ${roles[0].count} roles created`);
    console.log(`   ✓ ${permissions[0].count} permissions created`);
    console.log(`   ✓ ${categories[0].count} categories created`);
    
    // Check admin user
    const { rows: adminUser } = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE phone = $1',
      ['+989123456789']
    );
    
    if (adminUser[0].count > 0) {
      console.log('   ✓ Default admin user created');
    } else {
      console.log('   ⚠ Default admin user not found');
    }
    
    // Check indexes
    const { rows: indexes } = await pool.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    
    console.log(`   ✓ ${indexes[0].count} database indexes created`);
    
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, verifySetup };