import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'EspritApp',
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    });

    console.log(`✅ MongoDB connecte avec succes`);
    console.log(`📊 Base de donnees: EspritApp`);
    console.log(`🌐 Cluster: ${process.env.MONGODB_URI.split('@')[1].split('/')[0]}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ Erreur MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
