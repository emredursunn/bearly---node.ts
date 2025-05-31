import dotenv from 'dotenv';
import sequelize from '../config/database';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');
    
    // Sync models
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables created/updated successfully');
    
    console.log('\n✅ Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.error('💡 Tip: Make sure your PostgreSQL server is running and your .env configuration is correct');
    console.error('    DB_NAME: ' + process.env.DB_NAME);
    console.error('    DB_USER: ' + process.env.DB_USER);
    console.error('    DB_HOST: ' + process.env.DB_HOST);
    console.error('    DB_PORT: ' + process.env.DB_PORT);
    console.error('\n💡 You may need to create the database manually using PostgreSQL commands');
    process.exit(1);
  }
}

setupDatabase();
