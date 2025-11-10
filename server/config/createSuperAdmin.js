import User from '../models/User.js';

// Fonction pour créer le super admin au démarrage
const createSuperAdmin = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!superAdminEmail || !superAdminPassword) {
      console.log('⚠️  Credentials du super admin non définis dans .env');
      return;
    }

    // Vérifier si le super admin existe déjà
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (existingSuperAdmin) {
      console.log('✅ Super admin existe déjà');
      return;
    }

    // Créer le super admin
    const superAdmin = await User.create({
      name: superAdminName,
      email: superAdminEmail,
      password: superAdminPassword,
      universityYear: 'Autre',
      authType: 'local',
      role: 'superadmin'
    });

    console.log('✅ Super admin créé avec succès!');
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Rôle: ${superAdmin.role}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création du super admin:', error.message);
  }
};

export default createSuperAdmin;
