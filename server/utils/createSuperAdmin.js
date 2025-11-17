import User from '../models/User.js';

const createSuperAdmin = async () => {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!email || !password) {
      console.log('⚠️  Credentials super admin non configures dans .env');
      return;
    }

    // Verifier si le super admin existe deja
    const existingSuperAdmin = await User.findOne({ email });

    if (existingSuperAdmin) {
      console.log('✅ Super admin existe deja');
      return;
    }

    // Creer le super admin
    const superAdmin = await User.create({
      name,
      email,
      password,
      role: 'superadmin',
      authType: 'local',
      universityYear: 'Autre'
    });

    console.log('✅ Super admin cree avec succes!');
    console.log(`📧 Email: ${email}`);
  } catch (error) {
    console.error('❌ Erreur lors de la creation du super admin:', error.message);
  }
};

export default createSuperAdmin;
