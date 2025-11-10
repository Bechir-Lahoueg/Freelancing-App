import { validationResult } from 'express-validator';
import TaskRequest from '../models/TaskRequest.js';
import Invoice from '../models/Invoice.js';

// Fonction pour calculer le prix en fonction des options
const calculatePrice = (taskType, options) => {
  let basePrice = 50; // Prix de base en DZD

  // Prix selon le type de tâche
  const taskPrices = {
    'rédaction': 50,
    'codage': 100,
    'présentation': 60,
    'rapport': 70,
    'recherche': 40,
    'traduction': 45,
    'autre': 50
  };

  basePrice = taskPrices[taskType] || 50;

  // Multiplicateurs selon les options
  const levelMultiplier = {
    'débutant': 1,
    'intermédiaire': 1.3,
    'avancé': 1.6,
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
    'très complexe': 2
  };

  // Calcul final
  let price = basePrice;
  price *= levelMultiplier[options.level] || 1;
  price *= deadlineMultiplier[options.deadline] || 1;
  price *= complexityMultiplier[options.complexity] || 1;
  price *= options.pages || 1;

  return Math.round(price);
};

// @desc    Créer une nouvelle demande de tâche
// @route   POST /api/tasks
// @access  Private
export const createTaskRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskType, title, description, options } = req.body;

    // Calculer le prix
    const price = calculatePrice(taskType, options || {});

    // Créer la tâche
    const task = await TaskRequest.create({
      userId: req.user._id,
      taskType,
      title,
      description,
      options: options || {},
      price
    });

    // Créer automatiquement une facture
    const invoice = await Invoice.create({
      requestId: task._id,
      userId: req.user._id,
      amount: price,
      taxAmount: Math.round(price * 0.19), // TVA 19%
      totalAmount: Math.round(price * 1.19)
    });

    res.status(201).json({
      task,
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir toutes les tâches de l'utilisateur
// @route   GET /api/tasks
// @access  Private
export const getUserTasks = async (req, res) => {
  try {
    const tasks = await TaskRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir une tâche spécifique
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await TaskRequest.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Vérifier que la tâche appartient à l'utilisateur
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le statut d'une tâche
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await TaskRequest.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Vérifier que la tâche appartient à l'utilisateur
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    task.status = req.body.status || task.status;
    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une tâche
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await TaskRequest.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Vérifier que la tâche appartient à l'utilisateur
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await task.deleteOne();

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
