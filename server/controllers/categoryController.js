import { validationResult } from 'express-validator';
import Category from '../models/Category.js';

// @desc    Obtenir toutes les catégories actives
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('name slug description icon color image order');

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir une catégorie par ID ou slug
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer une nouvelle catégorie (Admin only)
// @route   POST /api/categories
// @access  Private (Admin/SuperAdmin)
export const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, icon, color, image, order } = req.body;

    // Vérifier si le nom existe déjà
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà' });
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || '📋',
      color: color || '#3B82F6',
      image: image || null,
      order: order || 0,
      createdBy: req.user._id,
      isActive: true
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour une catégorie (Admin only)
// @route   PUT /api/categories/:id
// @access  Private (Admin/SuperAdmin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, image, order, isActive } = req.body;

    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    // Vérifier si le nouveau nom existe déjà (si modifié)
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        return res.status(400).json({ message: 'Ce nom de catégorie est déjà utilisé' });
      }
    }

    category = await Category.findByIdAndUpdate(
      id,
      {
        name: name || category.name,
        description: description || category.description,
        icon: icon !== undefined ? icon : category.icon,
        color: color || category.color,
        image: image !== undefined ? image : category.image,
        order: order !== undefined ? order : category.order,
        isActive: isActive !== undefined ? isActive : category.isActive
      },
      { new: true, runValidators: true }
    );

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une catégorie (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private (Admin/SuperAdmin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json({ message: 'Catégorie supprimée avec succès', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activer/Désactiver une catégorie (Admin only)
// @route   PATCH /api/categories/:id/toggle
// @access  Private (Admin/SuperAdmin)
export const toggleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Réorganiser les catégories (Admin only)
// @route   PUT /api/categories/reorder
// @access  Private (Admin/SuperAdmin)
export const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Format invalide' });
    }

    const updatedCategories = await Promise.all(
      categories.map((cat, index) =>
        Category.findByIdAndUpdate(
          cat._id,
          { order: index },
          { new: true }
        )
      )
    );

    res.json(updatedCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
