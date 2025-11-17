import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";

export default function PartnerForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    personality: "",
    domain: "",
    experience: "",
    pricingModel: "",
    priceValue: "",
    availability: "",
    motivation: "",
    message: "",
  });
  
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Ajouter tous les champs du formulaire
      Object.keys(form).forEach(key => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });
      
      // Ajouter le fichier CV si présent
      if (cvFile) {
        formData.append('cv', cvFile);
      }
      
      const response = await axios.post('https://freelancing-app-mdgw.onrender.com/api/partner/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      setForm({
        fullName: "",
        email: "",
        age: "",
        personality: "",
        domain: "",
        experience: "",
        pricingModel: "",
        priceValue: "",
        availability: "",
        motivation: "",
        message: "",
      });
      setCvFile(null);
      
      // Réinitialiser le succès après 5 secondes
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-24 pb-8">
        <div className="flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-md shadow-2xl p-10 rounded-3xl w-full max-w-2xl border border-white/40"
          >
          <h1 className="text-4xl font-extrabold mb-3 text-center text-blue-700">Devenir Partenaire</h1>
          <p className="text-gray-600 mb-8 text-center text-lg">
            Rejoignez notre réseau avec un formulaire intelligent et moderne.
          </p>

        {/* Message de succès */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-semibold">Demande envoyée avec succès !</p>
              <p className="text-green-700 text-sm">Nous examinerons votre candidature et vous contacterons bientôt.</p>
            </div>
          </motion.div>
        )}

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold">Erreur</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom complet */}
          <div className="group">
            <label className="block font-semibold mb-1">Nom complet</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full p-4 border rounded-xl bg-white/60 backdrop-blur hover:bg-white transition outline-blue-400"
              required
            />
          </div>

          {/* Email & Âge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Âge</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
                required
              />
            </div>
          </div>

          {/* Personnalité */}
          <div>
            <label className="block font-semibold mb-1">Votre personnalité</label>
            <select
              name="personality"
              value={form.personality}
              onChange={handleChange}
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Calme et organisé">Calme et organisé</option>
              <option value="Créatif et innovateur">Créatif et innovateur</option>
              <option value="Leader et motivé">Leader et motivé</option>
              <option value="Sérieux et rigoureux">Sérieux et rigoureux</option>
              <option value="Flexible et sociable">Flexible et sociable</option>
            </select>
          </div>

          {/* Domaine */}
          <div>
            <label className="block font-semibold mb-1">Domaine souhaité</label>
            <select
              name="domain"
              value={form.domain}
              onChange={handleChange}
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Développement Web">Développement Web</option>
              <option value="Développement Mobile">Développement Mobile</option>
              <option value="Encadrant / Enseignant PFE">Encadrant / Enseignant PFE</option>
              <option value="Designer UI/UX">Designer UI/UX</option>
              <option value="Support Technique">Support Technique</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Expérience */}
          <div>
            <label className="block font-semibold mb-1">Expérience</label>
            <input
              type="text"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="ex: 2 ans / Senior / Débutant"
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
              required
            />
          </div>

          {/* Modèle de prix */}
          <div>
            <label className="block font-semibold mb-1">Modèle de prix</label>
            <select
              name="pricingModel"
              value={form.pricingModel}
              onChange={handleChange}
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Salaire mensuel">Salaire mensuel</option>
              <option value="Prix par projet">Prix par projet</option>
              <option value="Éducateur (prix par séance)">Éducateur (prix par séance)</option>
            </select>
          </div>

          {/* Prix proposé */}
          <div>
            <label className="block font-semibold mb-1">Prix proposé</label>
            <input
              type="text"
              name="priceValue"
              value={form.priceValue}
              onChange={handleChange}
              placeholder="ex: 1200DT / 50DT la séance / 300DT par projet"
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
              required
            />
          </div>

          {/* Disponibilité */}
          <div>
            <label className="block font-semibold mb-1">Disponibilité</label>
            <input
              type="text"
              name="availability"
              value={form.availability}
              onChange={handleChange}
              placeholder="ex: Soir / Week-end / Temps plein"
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
            />
          </div>

          {/* Motivation */}
          <div>
            <label className="block font-semibold mb-1">Votre motivation</label>
            <textarea
              name="motivation"
              value={form.motivation}
              onChange={handleChange}
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400 h-28"
            ></textarea>
          </div>

          {/* CV */}
          <div>
            <label className="block font-semibold mb-1">Uploader votre CV</label>
            <input
              type="file"
              name="cv"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400"
            />
            {cvFile && (
              <p className="text-sm text-green-600 mt-2">✓ {cvFile.name}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block font-semibold mb-1">Message supplémentaire</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="w-full p-4 border rounded-xl bg-white/60 hover:bg-white outline-blue-400 h-28"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer ma candidature'
            )}
          </button>
        </form>
      </motion.div>
        </div>
      
      {/* Footer */}
      <footer className="text-center text-gray-700 py-6">
        <p className="text-sm font-medium">© 2025 Do IT - Plateforme de freelancing</p>
        <p className="text-xs mt-2 text-gray-600">Votre partenaire de confiance pour vos projets</p>
      </footer>
    </div>
    </>
  );
}