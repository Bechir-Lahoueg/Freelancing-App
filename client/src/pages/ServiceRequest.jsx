import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { publicAxios, privateAxios } from '../utils/axios';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

const ServiceRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    answers: {},
    specialOptionsAnswers: {} // {optionId: {choiceId, customValue, price}}
  });

  const [totalPrice, setTotalPrice] = useState(0);

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (serviceId) {
      fetchService();
    }
  }, [serviceId, user]);

  const fetchService = async () => {
    try {
      // Recuperer le service (route publique)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Preparer les reponses avec les labels
      const answersArray = service.questions?.map(q => ({
        questionId: q.id,
        questionLabel: q.label,
        answer: formData.answers[q.id] || ''
      })) || [];

      // Preparer les options selectionnees avec leurs infos
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

      // Utiliser privateAxios qui ajoute automatiquement le token
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

    const renderMainInput = () => {
      switch (question.type) {
        case 'textarea':
          return (
            <textarea
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              required={question.required}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
            />
          );

        case 'select':
          return (
            <select
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              required={question.required}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                <label key={idx} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition">
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
                <label key={idx} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition">
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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          );

        default: // text
          return (
            <input
              type="text"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              required={question.required}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          );
      }
    };

    return (
      <div className="space-y-3">
        {renderMainInput()}
        
        {/* ✨ NOUVEAU : Sous-champs (fields) */}
        {question.fields && question.fields.length > 0 && (
          <div className="ml-4 pl-4 border-l-2 border-slate-600 space-y-3 mt-3">
            {question.fields.map((field) => {
              const fieldValue = formData.answers[`${question.id}_field_${field.id}`] || '';
              
              return (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={fieldValue}
                      onChange={(e) => handleAnswerChange(`${question.id}_field_${field.id}`, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={fieldValue}
                      onChange={(e) => handleAnswerChange(`${question.id}_field_${field.id}`, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
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
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Demande envoyee !</h2>
          <p className="text-slate-400">Redirection vers votre dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-white transition mb-4 sm:mb-6 text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              Retour
            </button>

            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                {service?.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400">{service?.categoryId?.name}</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">{service?.name}</h1>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base line-clamp-2">{service?.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-slate-800 rounded-xl p-4 sm:p-6 md:p-8 border border-slate-700 space-y-4 sm:space-y-6"
          >
            {/* Informations generales */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Informations generales</h3>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Titre de votre demande *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Redaction de rapport de stage"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Description detaillee *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Decrivez votre projet en detail..."
                  required
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                    Budget (optionnel)
                  </label>
                  <div className="mb-1.5 sm:mb-2">
                    <p className="text-xs text-slate-400">
                      💰 Prix du service : <span className="text-orange-400 font-bold">{service?.basePrice || 0} TND</span>
                    </p>
                  </div>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="Votre budget (optionnel)"
                    min="0"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                    Date limite (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm sm:text-base text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Options speciales - DESACTIVE */}
            {false && service?.isSpecial && service.specialOptions && service.specialOptions.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Options personnalisables</h3>
                  {service.basePrice > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Prix de base</p>
                      <p className="text-lg font-bold text-white">{service.basePrice} TND</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {service.specialOptions.map((option, index) => {
                    const selectedAnswer = formData.specialOptionsAnswers[option.id];
                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="p-4 bg-slate-700 rounded-lg border border-slate-600"
                      >
                        <label className="block text-sm font-medium text-slate-300 mb-3">
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
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
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
                          <div className="space-y-2">
                            {option.choices?.map(choice => (
                              <label
                                key={choice.id}
                                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition border border-slate-600"
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`option-${option.id}`}
                                    value={choice.id}
                                    checked={selectedAnswer?.choiceId === choice.id}
                                    onChange={() => handleSpecialOptionChange(option.id, choice.id, choice.label, choice.price)}
                                    required={option.required && !selectedAnswer}
                                    className="w-4 h-4 text-orange-500"
                                  />
                                  <span className="text-white">{choice.label}</span>
                                </div>
                                <span className="text-green-400 font-semibold">+{choice.price} TND</span>
                              </label>
                            ))}
                            
                            {option.allowOther && (
                              <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition border border-slate-600">
                                  <input
                                    type="radio"
                                    name={`option-${option.id}`}
                                    value="other"
                                    checked={selectedAnswer?.choiceId === 'other'}
                                    onChange={() => handleSpecialOptionChange(option.id, 'other', 'Autre', 0, selectedAnswer?.customValue || '')}
                                    className="w-4 h-4 text-orange-500"
                                  />
                                  <span className="text-white">Autre (preciser)</span>
                                </label>
                                
                                {selectedAnswer?.choiceId === 'other' && (
                                  <input
                                    type="text"
                                    value={selectedAnswer?.customValue || ''}
                                    onChange={(e) => handleSpecialOptionChange(option.id, 'other', 'Autre', 0, e.target.value)}
                                    placeholder="Precisez votre choix..."
                                    required={option.required}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500"
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

                {/* Prix total */}
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Prix total estime</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {Object.keys(formData.specialOptionsAnswers).length} option(s) selectionnee(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                        {totalPrice} TND
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Questions specifiques */}
            {service?.questions && service.questions.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Questions specifiques</h3>
                
                {service.questions
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {question.label} {question.required && <span className="text-red-400">*</span>}
                      </label>
                      {renderQuestion(question)}
                    </motion.div>
                  ))}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-orange-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Envoyer la demande</span>
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequest;
