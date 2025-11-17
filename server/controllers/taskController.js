import { validationResult } from 'express-validator';
import TaskRequest from '../models/TaskRequest.js';
import Invoice from '../models/Invoice.js';

// Fonction pour calculer le prix en fonction des options
const calculatePrice = (taskType, options) => {
  let basePrice = 50; // Prix de base en DZD

  // Prix selon le type de tache
  const taskPrices = {
    'redaction': 50,
    'codage': 100,
    'presentation': 60,
    'rapport': 70,
    'recherche': 40,
    'traduction': 45,
    'autre': 50
  };

  basePrice = taskPrices[taskType] || 50;

  // Multiplicateurs selon les options
  const levelMultiplier = {
    'debutant': 1,
    'intermediaire': 1.3,
    'avance': 1.6,
    'expert': 2
  };

  const deadlineMultiplier = {
    '24h': 2,
    '48h': 1.5,
    '1 semaine': 1,
    '2 semaines': 0.9,
    '1 mois': 0.8
  };

  const complexityMultiplier = {
    'simple': 1,
    'moyen': 1.3,
    'complexe': 1.6,
    'tres complexe': 2
  };

  // Calcul final
  let price = basePrice;
  price *= levelMultiplier[options.level] || 1;
  price *= deadlineMultiplier[options.deadline] || 1;
  price *= complexityMultiplier[options.complexity] || 1;
  price *= options.pages || 1;

  return Math.round(price);
};

// @desc    Creer une nouvelle demande de tache
// @route   POST /api/tasks
// @access  Private
export const createTaskRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId, categoryId, title, description, budget, deadline, answers } = req.body;

    // Creer la tache avec les reponses personnalisees
    const task = await TaskRequest.create({
      userId: req.user._id,
      serviceId,
      categoryId: categoryId || null,
      title,
      description,
      budget: budget || null,
      deadline: deadline || null,
      responses: answers || [],
      status: 'pending'
    });

    // Peupler les informations du service et de la categorie
    await task.populate([
      { path: 'serviceId', select: 'name icon' },
      { path: 'categoryId', select: 'name icon' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Demande creee avec succes',
      task
    });
  } catch (error) {
    console.error('Erreur creation tache:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir toutes les taches de l'utilisateur
// @route   GET /api/tasks
// @access  Private
export const getUserTasks = async (req, res) => {
  try {
    const tasks = await TaskRequest.find({ userId: req.user._id })
      .populate('serviceId', 'name icon')
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir une tache specifique
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await TaskRequest.findById(req.params.id)
      .populate('serviceId', 'name icon')
      .populate('categoryId', 'name icon');

    if (!task) {
      return res.status(404).json({ message: 'Tache non trouvee' });
    }

    // Verifier que la tache appartient a l'utilisateur
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorise' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre a jour le statut d'une tache
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await TaskRequest.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tache non trouvee' });
    }

    // Verifier que la tache appartient a l'utilisateur
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorise' });
    }

    task.status = req.body.status || task.status;
    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une tache
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await TaskRequest.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tache non trouvee' });
    }

    // Verifier que la tache appartient a l'utilisateur
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorise' });
    }

    await task.deleteOne();

    res.json({ message: 'Tache supprimee avec succes' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
