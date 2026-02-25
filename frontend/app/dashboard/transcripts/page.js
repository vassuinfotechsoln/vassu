'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, MessageSquare, Clock, User, Bot, Filter, Download } from 'lucide-react'

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTranscript, setSelectedTranscript] = useState(null)

  useEffect(() => {
    // Mock data for now
    setTranscripts([
      {
        id: '1',
        callId: 'call_1',
        phoneNumber: '+1234567890',
        agentName: 'Customer Support Agent',
        date: new Date().toISOString(),
        duration: 120,
        sentiment: 'positive',
        messages: [
          { speaker: 'user', text: 'Hello, I need help with my account', timestamp: '00:00' },
          { speaker: 'assistant', text: 'I\'d be happy to help you with your account. What specific issue are you experiencing?', timestamp: '00:05' },
          { speaker: 'user', text: 'I can\'t access my dashboard and my password reset isn\'t working', timestamp: '00:15' },
          { speaker: 'assistant', text: 'I understand your frustration. Let me help you resolve this issue right away. Can you please provide me with your email address?', timestamp: '00:25' }
        ]
      },
      {
        id: '2',
        callId: 'call_2',
        phoneNumber: '+9876543210',
        agentName: 'Sales Agent',
        date: new Date(Date.now() - 86400000).toISOString(),
        duration: 180,
        sentiment: 'neutral',
        messages: [
          { speaker: 'user', text: 'Hi, I\'m interested in your premium plan', timestamp: '00:00' },
          { speaker: 'assistant', text: 'Great! I\'d be happy to tell you about our premium features. What specific capabilities are you looking for?', timestamp: '00:03' }
        ]
      }
    ])
  }, [])

  const filteredTranscripts = transcripts.filter(transcript =>
    transcript.messages.some(msg => 
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    ) || transcript.phoneNumber.includes(searchTerm) || 
    transcript.agentName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'from-emerald-500 to-green-600'
      case 'negative': return 'from-red-500 to-rose-600'
      default: return 'from-blue-500 to-cyan-600'
    }
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      {/* Premium Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/25">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text mb-2">
                Transcripts
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Analyze conversation insights and patterns
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="glass-card rounded-2xl p-4 hover:scale-105 transition-all duration-300 group">
              <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
            </button>
            <button className="glass-card rounded-2xl p-4 hover:scale-105 transition-all duration-300 group">
              <Download className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card rounded-3xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 h-6 w-6" />
            <input
              type="text"
              placeholder="Search transcripts, phone numbers, agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium backdrop-blur-sm transition-all duration-300 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Transcripts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredTranscripts.map((transcript) => (
          <div 
            key={transcript.id} 
            className="group relative cursor-pointer"
            onClick={() => setSelectedTranscript(transcript)}
          >
            {/* Card Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getSentimentColor(transcript.sentiment)}/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative glass-card rounded-3xl p-8 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getSentimentColor(transcript.sentiment)} rounded-xl flex items-center justify-center shadow-lg`}>
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{transcript.phoneNumber}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{transcript.agentName}</div>
                  </div>
                </div>
                
                <div className={`px-3 py-1 bg-gradient-to-r ${getSentimentColor(transcript.sentiment)} text-white text-xs font-bold rounded-full capitalize`}>
                  {transcript.sentiment}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {Math.floor(transcript.duration / 60)}:{(transcript.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {new Date(transcript.date).toLocaleDateString()}
                </div>
              </div>

              {/* Message Preview */}
              <div className="space-y-3">
                {transcript.messages.slice(0, 2).map((message, index) => (
                  <div key={index} className={`p-4 rounded-2xl ${
                    message.speaker === 'user' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30' 
                      : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {message.speaker === 'user' ? (
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {message.speaker === 'user' ? 'Caller' : 'AI Agent'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-500">{message.timestamp}</span>
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {message.text}
                    </div>
                  </div>
                ))}
                
                {transcript.messages.length > 2 && (
                  <div className="text-center">
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      +{transcript.messages.length - 2} more messages
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTranscripts.length === 0 && (
        <div className="text-center py-20">
          <div className="relative mx-auto mb-8">
            <div className="w-32 h-32 glass-card rounded-3xl flex items-center justify-center">
              <MessageSquare className="h-16 w-16 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            {searchTerm ? 'No Matching Transcripts' : 'No Transcripts Yet'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
            {searchTerm 
              ? 'Try adjusting your search terms to find what you\'re looking for.' 
              : 'Conversation transcripts will appear here after calls are completed.'}
          </p>
        </div>
      )}

      {/* Transcript Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {selectedTranscript.phoneNumber}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">{selectedTranscript.agentName}</p>
                </div>
                <button
                  onClick={() => setSelectedTranscript(null)}
                  className="glass rounded-2xl p-3 hover:bg-red-500/20 transition-all duration-300"
                >
                  <span className="text-slate-600 dark:text-slate-400 text-xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedTranscript.messages.map((message, index) => (
                  <div key={index} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.speaker === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {message.speaker === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wide opacity-75">
                          {message.speaker === 'user' ? 'Caller' : 'AI Agent'}
                        </span>
                        <span className="text-xs opacity-60">{message.timestamp}</span>
                      </div>
                      <div className="text-sm leading-relaxed">{message.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}