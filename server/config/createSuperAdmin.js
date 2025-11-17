import User from '../models/User.js';

// Fonction pour creer le super admin au demarrage
const createSuperAdmin = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!superAdminEmail || !superAdminPassword) {
      console.log('⚠️  Credentials du super admin non definis dans .env');
      return;
    }

    // Verifier si le super admin existe deja
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (existingSuperAdmin) {
      console.log('✅ Super admin existe deja');
      return;
    }

    // Creer le super admin
    const superAdmin = await User.create({
      name: superAdminName,
      email: superAdminEmail,
      password: superAdminPassword,
      universityYear: 'Autre',
      authType: 'local',
      role: 'superadmin'
    });

    console.log('✅ Super admin cree avec succes!');
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Role: ${superAdmin.role}`);
  } catch (error) {
    console.error('❌ Erreur lors de la creation du super admin:', error.message);
  }
};

export default createSuperAdmin;
