import { validationResult } from 'express-validator';
import Service from '../models/Service.js';

// @desc    Obtenir tous les services actifs
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = { isActive: true };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const services = await Service.find(filter)
      .populate('categoryId', 'name icon')
      .sort({ order: 1, createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir un service par ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('categoryId', 'name icon description');

    if (!service) {
      return res.status(404).json({ message: 'Service non trouve' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Creer un nouveau service (Admin)
// @route   POST /api/services
// @access  Private (Admin/SuperAdmin)
export const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      categoryId, 
      name, 
      description, 
      icon, 
      image, 
      questions, 
      basePrice, 
      estimatedDuration, 
      order,
      isSpecial,
      specialOptions
    } = req.body;

    const service = await Service.create({
      categoryId,
      name,
      description,
      icon: icon || '📋',
      image,
      questions: questions || [],
      basePrice: basePrice || 0,
      estimatedDuration,
      order: order || 0,
      isSpecial: isSpecial || false,
      specialOptions: specialOptions || [],
      createdBy: req.user._id,
      isActive: true
    });

    await service.populate('categoryId', 'name icon');

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre a jour un service (Admin)
// @route   PUT /api/services/:id
// @access  Private (Admin/SuperAdmin)
export const updateService = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      icon, 
      image, 
      questions, 
      basePrice, 
      estimatedDuration, 
      order, 
      isActive,
      isSpecial,
      specialOptions
    } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        icon,
        image,
        questions,
        basePrice,
        estimatedDuration,
        order,
        isActive,
        isSpecial,
        specialOptions,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name icon');

    if (!service) {
      return res.status(404).json({ message: 'Service non trouve' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un service (Admin)
// @route   DELETE /api/services/:id
// @access  Private (Admin/SuperAdmin)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service non trouve' });
    }

    res.json({ message: 'Service supprime avec succes' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
