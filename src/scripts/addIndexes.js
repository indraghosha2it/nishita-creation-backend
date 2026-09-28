// src/scripts/addIndexes.js
const mongoose = require('mongoose');
const path = require('path');

// ✅ FIX: Go up two levels from src/scripts to reach root
const rootPath = path.join(__dirname, '../..');

// Load environment variables from root
require('dotenv').config({ path: path.join(rootPath, '.env') });

// ✅ FIX: Product model path from root
const Product = require(path.join(rootPath, 'src/models/Product'));
const RestockLog = require(path.join(rootPath, 'src/models/RestockLog'));

async function addIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📊 MongoDB URI found:', process.env.MONGODB_URI ? '✅ Yes' : '❌ No');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('📁 Looking for .env at:', path.join(rootPath, '.env'));
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    console.log('📊 Creating indexes...');

    console.log('  → Rebuilding restock idempotency index...');
    const restockIndexes = await RestockLog.collection.indexes();
    const oldIdempotencyIndex = restockIndexes.find(
      index => index.name === 'idempotencyKey_1'
    );
    if (oldIdempotencyIndex) {
      await RestockLog.collection.dropIndex('idempotencyKey_1');
    }
    await RestockLog.collection.createIndex(
      { idempotencyKey: 1 },
      {
        name: 'idempotencyKey_unique_string',
        unique: true,
        partialFilterExpression: { idempotencyKey: { $type: 'string' } },
      }
    );

    // Add compound indexes for common queries
    console.log('  → Creating category+isActive+createdAt index...');
    await Product.collection.createIndex(
      { category: 1, isActive: 1, createdAt: -1 }
    );
    
    console.log('  → Creating brand+isActive index...');
    await Product.collection.createIndex(
      { brand: 1, isActive: 1 }
    );
    
    console.log('  → Creating unit+isActive index...');
    await Product.collection.createIndex(
      { unit: 1, isActive: 1 }
    );
    
    console.log('  → Creating tags+isActive index...');
    await Product.collection.createIndex(
      { tags: 1, isActive: 1 }
    );
    
    console.log('  → Creating text search index...');
    await Product.collection.createIndex(
      { productName: 'text', brand: 'text', fullDescription: 'text' }
    );

    console.log('✅ All indexes created successfully!');
    console.log('📊 Index list:');
    const indexes = await Product.collection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

addIndexes();