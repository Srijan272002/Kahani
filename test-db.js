import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Attempting to connect to database...');
    const result = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Successfully connected to database:', result[0].current_database);
    
    // Test creating a user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    console.log('Successfully created test user:', user);
    
    // Clean up
    await prisma.user.delete({
      where: { email: 'test@example.com' }
    });
    console.log('Successfully cleaned up test data');
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 