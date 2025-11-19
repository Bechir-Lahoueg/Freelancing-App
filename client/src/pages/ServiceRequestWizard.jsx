import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { publicAxios, privateAxios } from '../utils/axios';
import { ArrowLeft, ArrowRight, Check, Calendar, DollarSign, FileText, Settings, Send, CheckCircle } from 'lucide-react';

const ServiceRequestWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    answers: {},
    specialOptionsAnswers: {}
  });

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (serviceId) {
      fetchService();
    }
  }, [serviceId, user]);

  useEffect(() => {
    // Calculer le prix total quand les options changent
    if (service?.isSpecial) {
      const basePrice = service.basePrice || 0;
      const optionsPrice = Object.values(formData.specialOptionsAnswers).reduce((sum, answer) => {
        return sum + (answer.price || 0);
      }, 0);
      setTotalPrice(basePrice + optionsPrice);
    } else {
      setTotalPrice(service?.basePrice || 0);
    }
  }, [formData.specialOptionsAnswers, service]);

  const fetchService = async () => {
    try {
      const response = await publicAxios.get(`/api/services/${serviceId}`);
      setService(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Service introuvable');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const handleSpecialOptionChange = (optionId, choiceId, choiceLabel, price, customValue = '') => {
    setFormData(prev => ({
      ...prev,
      specialOptionsAnswers: {
        ...prev.specialOptionsAnswers,
        [optionId]: {
          choiceId,
          choiceLabel,
          price,
          customValue
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const answersArray = service.questions?.map(q => ({
        questionId: q.id,
        questionLabel: q.label,
        answer: formData.answers[q.id] || ''
      })) || [];

      const selectedOptionsData = Object.entries(formData.specialOptionsAnswers).map(([optionId, answer]) => {
        const option = service.specialOptions?.find(opt => opt.id === optionId);
        return {
          optionId: optionId,
          optionName: option?.name || '',
          choiceId: answer.choiceId,
          choiceLabel: answer.choiceLabel,
          price: answer.price,
          customValue: answer.customValue || ''
        };
      });

      const requestData = {
        serviceId: service._id,
        categoryId: service.categoryId._id,
        title: formData.title,
        description: formData.description,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        deadline: formData.deadline || null,
        answers: answersArray,
        selectedOptions: selectedOptionsData,
        basePrice: service.basePrice || 0,
        totalPrice: totalPrice
      };

      await privateAxios.post('/api/tasks', requestData);

      setSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const value = formData.answers[question.id] || '';

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          >
            <option value="">Selectionner...</option>
            {question.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition border border-slate-600">
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.required}
                  className="w-4 h-4 text-orange-500"
                />
                <span className="text-white">{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition border border-slate-600">
                <input
                  type="checkbox"
                  value={opt}
                  checked={(value || []).includes(opt)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, opt]
                      : currentValues.filter(v => v !== opt);
                    handleAnswerChange(question.id, newValues);
                  }}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-white">{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        );
    }
  };

  // Définir les étapes
  const steps = [
    {
      id: 'info',
      title: 'Informations generales',
      icon: FileText,
      component: () => (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Titre de votre demande *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Redaction de rapport de stage"
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description detaillee *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Decrivez votre projet en detail..."
              required
              rows={5}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <DollarSign size={16} />
                Budget (optionnel)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="Ex: 500"
                min="0"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Calendar size={16} />
                Date limite (optionnel)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  // Ajouter l'étape des options spéciales si le service est spécial
  if (service?.isSpecial && service.specialOptions?.length > 0) {
    steps.push({
      id: 'options',
      title: 'Options personnalisables',
      icon: Settings,
      component: () => (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Prix de base</p>
                <p className="text-2xl font-bold text-white">{service.basePrice} TND</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-300">Prix total</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  {totalPrice} TND
                </p>
              </div>
            </div>
          </div>

          {service.specialOptions.map((option, index) => {
            const selectedAnswer = formData.specialOptionsAnswers[option.id];
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-5 bg-slate-800/50 rounded-xl border border-slate-600"
              >
                <label className="block text-base font-semibold text-white mb-4">
                  {option.name}
                  {option.required && <span className="text-red-400 ml-1">*</span>}
                </label>

                {option.type === 'select' ? (
                  <select
                    value={selectedAnswer?.choiceId || ''}
                    onChange={(e) => {
                      const choice = option.choices?.find(c => c.id === e.target.value);
                      if (choice) {
                        handleSpecialOptionChange(option.id, choice.id, choice.label, choice.price);
                      }
                    }}
                    required={option.required}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 transition"
                  >
                    <option value="">Selectionner...</option>
                    {option.choices?.map(choice => (
                      <option key={choice.id} value={choice.id}>
                        {choice.label} (+{choice.price} TND)
                      </option>
                    ))}
                    {option.allowOther && (
                      <option value="other">Autre (specifier)</option>
                    )}
                  </select>
                ) : (
                  <div className="space-y-3">
                    {option.choices?.map(choice => (
                      <label
                        key={choice.id}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition border-2 ${
                          selectedAnswer?.choiceId === choice.id
                            ? 'bg-orange-500/20 border-orange-500'
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`option-${option.id}`}
                            value={choice.id}
                            checked={selectedAnswer?.choiceId === choice.id}
                            onChange={() => handleSpecialOptionChange(option.id, choice.id, choice.label, choice.price)}
                            required={option.required && !selectedAnswer}
                            className="w-5 h-5 text-orange-500"
                          />
                          <span className="text-white font-medium">{choice.label}</span>
                        </div>
                        <span className="text-green-400 font-bold text-lg">+{choice.price} TND</span>
                      </label>
                    ))}
                    
                    {option.allowOther && (
                      <div className="space-y-3">
                        <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition border-2 ${
                          selectedAnswer?.choiceId === 'other'
                            ? 'bg-orange-500/20 border-orange-500'
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}>
                          <input
                            type="radio"
                            name={`option-${option.id}`}
                            value="other"
                            checked={selectedAnswer?.choiceId === 'other'}
                            onChange={() => handleSpecialOptionChange(option.id, 'other', 'Autre', 0, selectedAnswer?.customValue || '')}
                            className="w-5 h-5 text-orange-500"
                          />
                          <span className="text-white font-medium">Autre (preciser)</span>
                        </label>
                        
                        {selectedAnswer?.choiceId === 'other' && (
                          <input
                            type="text"
                            value={selectedAnswer?.customValue || ''}
                            onChange={(e) => handleSpecialOptionChange(option.id, 'other', 'Autre', 0, e.target.value)}
                            placeholder="Precisez votre choix..."
                            required={option.required}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 transition"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )
    });
  }

  // Ajouter l'étape des questions si elles existent
  if (service?.questions?.length > 0) {
    steps.push({
      id: 'questions',
      title: 'Questions specifiques',
      icon: FileText,
      component: () => (
        <div className="space-y-6">
          {service.questions
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {question.label} {question.required && <span className="text-red-400">*</span>}
                </label>
                {renderQuestion(question)}
              </motion.div>
            ))}
        </div>
      )
    });
  }

  // Étape de confirmation
  steps.push({
    id: 'confirm',
    title: 'Confirmation',
    icon: CheckCircle,
    component: () => (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recapitulatif de votre demande</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Service</p>
              <p className="text-lg font-semibold text-white">{service?.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Titre</p>
              <p className="text-lg font-semibold text-white">{formData.title}</p>
            </div>

            {service?.isSpecial && Object.keys(formData.specialOptionsAnswers).length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Options selectionnees</p>
                {Object.entries(formData.specialOptionsAnswers).map(([optionId, answer]) => {
                  const option = service.specialOptions?.find(opt => opt.id === optionId);
                  return (
                    <div key={optionId} className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-white">{option?.name}: {answer.customValue || answer.choiceLabel}</span>
                      <span className="text-green-400 font-semibold">+{answer.price} TND</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-600">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-slate-300">Prix total</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  {totalPrice} TND
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <p className="text-sm text-slate-300">
            En confirmant, vous acceptez que votre demande soit examinee par notre equipe. 
            Vous recevrez une notification une fois votre demande approuvee.
          </p>
        </div>
      </div>
    )
  });

  const canGoNext = () => {
    const step = steps[currentStep];
    
    if (step.id === 'info') {
      return formData.title && formData.description;
    }
    
    if (step.id === 'options') {
      // Vérifier que toutes les options obligatoires sont remplies
      const requiredOptions = service.specialOptions.filter(opt => opt.required);
      return requiredOptions.every(opt => formData.specialOptionsAnswers[opt.id]);
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Navbar />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
            <CheckCircle size={56} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Demande envoyee !</h2>
          <p className="text-slate-400 text-lg">Redirection vers votre dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
            >
              <ArrowLeft size={20} />
              Retour
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-orange-500/30">
                {service?.icon}
              </div>
              <div>
                <p className="text-sm text-slate-400">{service?.categoryId?.name}</p>
                <h1 className="text-4xl font-bold text-white">{service?.name}</h1>
              </div>
            </div>
          </motion.div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center relative">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          backgroundColor: isCompleted ? '#10b981' : isActive ? '#f97316' : '#334155'
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                          isActive ? 'shadow-orange-500/50' : isCompleted ? 'shadow-green-500/50' : ''
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={24} className="text-white" />
                        ) : (
                          <Icon size={24} className="text-white" />
                        )}
                      </motion.div>
                      <p className={`text-xs mt-2 font-medium ${
                        isActive ? 'text-orange-400' : isCompleted ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].component()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} />
                Precedent
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={!canGoNext()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Confirmer la demande
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestWizard;
