import { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ChatPanel from './ChatPanel';
import { useAuth } from '../context/AuthContext';

const ChatSection = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('chat'); // 'chat' or 'search'
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const API_URL = `${import.meta.env.VITE_API_URL || 'https://freelancing-app-mdgw.onrender.com'}/api`;
  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  const handleSearchConversation = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations/search/${searchCode.trim().toUpperCase()}`,
        { headers }
      );
      setSearchResult(response.data);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setSearchError(error.response?.data?.message || 'Conversation introuvable');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-slate-800 rounded-xl overflow-hidden">
      {/* Header avec tabs */}
      <div className="flex border-b border-slate-700 bg-slate-750">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
            activeView === 'chat'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <MessageCircle size={20} />
          Messagerie
        </button>
        {user?.role === 'superadmin' && (
          <button
            onClick={() => setActiveView('search')}
            className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
              activeView === 'search'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Search size={20} />
            Recherche par Code
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'chat' ? (
          <ChatPanel />
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className='text-2xl font-semibold mb-6 flex items-center gap-3 text-white'>
                <Search className="text-orange-400" />
                Rechercher une conversation par code
              </h2>

              <form onSubmit={handleSearchConversation} className='mb-6'>
                <div className='flex gap-3'>
                  <input
                    type='text'
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    className='flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                    placeholder='CONV-XXXXXX'
                    maxLength={12}
                  />
                  <button
                    type='submit'
                    disabled={searchLoading || !searchCode.trim()}
                    className='px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {searchLoading ? (
                      <>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Rechercher
                      </>
                    )}
                  </button>
                </div>
              </form>

              {searchError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300'
                >
                  {searchError}
                </motion.div>
              )}

              {searchResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='space-y-6'
                >
                  {/* Conversation Info */}
                  <div className='bg-slate-750 p-6 rounded-lg border border-slate-600'>
                    <h3 className='text-xl font-bold mb-4 text-orange-400'>Informations de la conversation</h3>
                    
                    <div className='grid md:grid-cols-2 gap-4 mb-4'>
                      <div>
                        <p className='text-slate-400 text-sm'>Code de conversation</p>
                        <p className='font-mono text-lg font-bold text-orange-400'>{searchResult.conversation.conversationCode}</p>
                      </div>
                      
                      <div>
                        <p className='text-slate-400 text-sm'>Agent assigné</p>
                        <p className='text-lg font-semibold text-green-400 flex items-center gap-2'>
                          👤 {searchResult.assignedAgent?.name || 'Non assigné'}
                        </p>
                        {searchResult.assignedAgent?.assignedAt && (
                          <p className='text-xs text-slate-500 mt-1'>
                            Assigné le {new Date(searchResult.assignedAgent.assignedAt).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='grid md:grid-cols-2 gap-4 mb-4'>
                      <div>
                        <p className='text-slate-400 text-sm'>Tâche associée</p>
                        <p className='font-semibold text-white'>{searchResult.conversation.taskRequestId?.title || 'N/A'}</p>
                        <p className='text-xs text-slate-500'>
                          Statut: {searchResult.conversation.taskRequestId?.status || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className='text-slate-400 text-sm'>Statut de la conversation</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          searchResult.conversation.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {searchResult.conversation.status === 'active' ? 'Active' : 'Archivée'}
                        </span>
                      </div>
                    </div>

                    <div className='mb-4'>
                      <p className='text-slate-400 text-sm mb-2'>Participants</p>
                      <div className='flex flex-wrap gap-3'>
                        {searchResult.conversation.participants.map((p, idx) => (
                          <div key={idx} className='bg-slate-700 px-4 py-2 rounded-lg border border-slate-600'>
                            <p className='font-semibold text-white'>{p.userId.name}</p>
                            <p className='text-xs text-slate-400'>{p.userId.email}</p>
                            <p className='text-xs text-orange-400 mt-1'>{p.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className='bg-slate-750 p-6 rounded-lg border border-slate-600'>
                    <h3 className='text-xl font-bold mb-4 text-orange-400'>
                      Messages ({searchResult.messages.length})
                    </h3>
                    
                    <div className='max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar'>
                      {searchResult.messages.map((msg) => (
                        <div 
                          key={msg._id} 
                          className={`p-4 rounded-lg ${
                            msg.messageType === 'system' 
                              ? 'bg-blue-500/10 border border-blue-500/30' 
                              : 'bg-slate-700 border border-slate-600'
                          }`}
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <p className='font-semibold text-white'>{msg.senderId.name}</p>
                              <p className='text-xs text-slate-400'>{msg.senderId.email}</p>
                            </div>
                            <div className='text-right'>
                              <p className='text-xs text-slate-400'>
                                {new Date(msg.createdAt).toLocaleString('fr-FR')}
                              </p>
                              {msg.messageType === 'system' && (
                                <span className='text-xs text-blue-400'>Message système</span>
                              )}
                            </div>
                          </div>
                          <p className='text-white whitespace-pre-wrap'>{msg.content}</p>
                          {msg.readBy && msg.readBy.length > 0 && (
                            <p className='text-xs text-green-400 mt-2'>
                              ✓✓ Lu par {msg.readBy.length} personne(s)
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!searchResult && !searchError && (
                <div className='text-center py-12 text-slate-400'>
                  <Search size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-lg mb-2">Entrez un code de conversation pour rechercher</p>
                  <p className='text-sm'>Format: CONV-XXXXXX</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSection;
