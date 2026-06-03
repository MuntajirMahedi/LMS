import React, { useState, useEffect, useRef } from 'react';
import { 
  Search,
  Send,
  Paperclip, 
  Smile, 
  ChevronLeft,
  Users,
  CheckCheck,
  Plus,
  Filter,
  UserPlus2,
  Reply,
  Copy,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getConversations, setConversations, getChatMessages, setChatMessages } from '../../mock/chatMock';
import { getUsers } from '../../mock/users';
import type { Conversation, ChatMessage } from '../../types/communication';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { RecipientSelector } from '../../components/communication/RecipientSelector';
import { useCommunication } from '../../hooks/useCommunication';
import { cn } from '../../lib/utils';

const ChatPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [allConversations, setAllConversations] = useState<Conversation[]>(getConversations());
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(getChatMessages());
  const [activeConv, setActiveConv] = useState<Conversation | null>(allConversations[0] || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Group creation states
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<'INDIVIDUAL' | 'FILTER'>('FILTER');
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetClass, setTargetClass] = useState<string>('ALL');
  const [targetSection, setTargetSection] = useState<string>('ALL');
  const [targetDepartment, setTargetDepartment] = useState<string>('ALL');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  
  const { recipients } = useCommunication();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversationsState] = useState<Conversation[]>(
    allConversations.filter(c => c.participants.includes(user?.id || ''))
  );

  useEffect(() => {
    if (activeConv) {
      setMessages(allMessages[activeConv.id] || []);
    }
  }, [activeConv]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !activeConv || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: activeConv.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: activeRole as any,
      content: inputValue,
      timestamp: new Date().toISOString(),
      type: 'TEXT',
      status: 'SENT'
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    const updatedAllMessages = { ...allMessages, [activeConv.id]: updatedMessages };
    setAllMessages(updatedAllMessages);
    setChatMessages(updatedAllMessages);
    setInputValue('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: activeConv.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: activeRole as any,
      content: file.name,
      timestamp: new Date().toISOString(),
      type: 'FILE',
      status: 'SENT',
      attachments: [file.name]
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    const updatedAllMessages = { ...allMessages, [activeConv.id]: updatedMessages };
    setAllMessages(updatedAllMessages);
    setChatMessages(updatedAllMessages);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startPrivateChat = (participantId: string) => {
    if (participantId === user?.id) return;
    
    // Check if direct conversation already exists
    const existing = conversations.find(c => 
      c.type === 'DIRECT' && c.participants.includes(participantId)
    );

    if (existing) {
      setActiveConv(existing);
    } else {
      const targetUser = getUsers().find(u => u.id === participantId);
      if (!targetUser) return;

      const newConv: Conversation = {
        id: `direct-${Date.now()}`,
        type: 'DIRECT',
        title: targetUser.name,
        participants: [user?.id || '', participantId],
        unreadCount: 0,
        lastMessage: {
          content: 'Started a new conversation',
          senderName: user?.name || '',
          timestamp: new Date().toISOString()
        }
      };
      const updatedConvs = [newConv, ...allConversations];
      setConversationsState([newConv, ...conversations]);
      setAllConversations(updatedConvs);
      setConversations(updatedConvs);
      setActiveConv(newConv);
    }
    setShowMembersModal(false);
  };

  // Resolve filters to user IDs
  const resolvedParticipants = selectionMode === 'FILTER' 
    ? getUsers().filter((u: any) => {
        const matchesRole = targetRoles.length === 0 || targetRoles.includes(u.role);
        const userClassId = u.metadata?.classId;
        const userAssignedClasses = u.metadata?.assignedClasses || [];
        const matchesClass = targetClass === 'ALL' || userClassId === targetClass || userAssignedClasses.includes(targetClass);
        const matchesSection = targetSection === 'ALL' || u.metadata?.sectionId === targetSection;
        const matchesDept = targetDepartment === 'ALL' || u.metadata?.departmentId === targetDepartment;
        
        const activeFilters = [targetRoles.length > 0, targetClass !== 'ALL', targetSection !== 'ALL', targetDepartment !== 'ALL'];
        if (activeFilters.filter(Boolean).length === 0) return false;

        return matchesRole && matchesClass && matchesSection && matchesDept;
      }).map((u: any) => u.id)
    : selectedForGroup;

  const totalParticipants = Array.from(new Set([user?.id || '', ...resolvedParticipants]));

  const handleCreateGroupWithFilters = () => {
    if (!newGroupName.trim() || totalParticipants.length <= 1) return;

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      type: 'GROUP',
      title: newGroupName,
      participants: totalParticipants,
      unreadCount: 0,
      lastMessage: {
        content: `Group created with ${totalParticipants.length - 1} members`,
        senderName: user?.name || '',
        timestamp: new Date().toISOString()
      },
      metadata: { icon: '📢' }
    };

    const updatedConvs = [newConv, ...allConversations];
    setConversationsState([newConv, ...conversations]);
    setAllConversations(updatedConvs);
    setConversations(updatedConvs);
    setActiveConv(newConv);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewGroupName('');
    setSelectedForGroup([]);
    setTargetRoles([]);
    setTargetClass('ALL');
    setTargetSection('ALL');
    setTargetDepartment('ALL');
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const EMOJI_CATEGORIES = [
    { label: 'Smileys', icons: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'] },
    { label: 'Gestures', icons: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶'] },
    { label: 'Heart & More', icons: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '✨', '🌟', '⭐', '💫', '🔥', '💥', '💢', '💨', '💦', '💤', '💨'] },
    { label: 'Activities', icons: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '👝', '🎒', '👞', '👟', '🥾', '🥿', '👠', '👡', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑️', '💄', '💍', '💼'] },
    { label: 'Objects', icons: ['⌚', '📱', '📲', '💻', '⌨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭'] }
  ];

  return (
    <div className="h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] flex bg-transparent sm:bg-white/40 sm:backdrop-blur-md sm:rounded-[20px] sm:border sm:border-border/10 sm:overflow-hidden sm:shadow-2xl sm:animate-in sm:fade-in sm:zoom-in-95 sm:duration-500">
      
      {/* Sidebar - Conversation List */}
      <div className={cn(
        "w-full lg:w-[380px] sm:border-r border-border/10 flex flex-col bg-transparent sm:bg-white/20 transition-all duration-300",
        !showSidebar && "hidden lg:flex"
      )}>
        <div className="p-4 sm:p-8 pb-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-[#3A2C2B]">Chats</h1>
            <Button 
              size="sm" 
              className="w-10 h-10 rounded-xl bg-[#3A2C2B] text-white shadow-lg shadow-black/10 p-0"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-12 h-11 sm:h-12 rounded-xl sm:rounded-2xl border-border bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-8 scrollbar-hide mt-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setActiveConv(conv);
                if (window.innerWidth < 1024) setShowSidebar(false);
              }}
              className={cn(
                "flex items-center gap-3 p-3 sm:rounded-2xl cursor-pointer transition-all border-b border-border/5 sm:border-none",
                activeConv?.id === conv.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 sm:shadow-lg" 
                  : "hover:bg-white/50 bg-transparent sm:bg-white/40"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-inner flex-shrink-0",
                activeConv?.id === conv.id ? "bg-white/20" : "bg-soft-parchment text-primary"
              )}>
                {conv.metadata?.icon || conv.title[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-bold text-sm truncate">{conv.title}</h4>
                  <span className={cn(
                    "text-[9px] font-bold uppercase",
                    activeConv?.id === conv.id ? "text-white/60" : "text-muted-foreground"
                  )}>
                    {new Date(conv.lastMessage?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={cn(
                    "text-xs truncate font-medium",
                    activeConv?.id === conv.id ? "text-white/80" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage?.content}
                  </p>
                  {conv.unreadCount > 0 && activeConv?.id !== conv.id && (
                    <div className="h-4 min-w-[16px] px-1 bg-brand-orange rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-transparent sm:bg-white/20 transition-all duration-300",
        showSidebar && "hidden lg:flex"
      )}>
        {activeConv ? (
          <>
            <div className="h-20 sm:h-24 px-0 sm:px-8 border-b border-border/10 flex items-center justify-between bg-transparent sm:bg-white/40 sm:backdrop-blur-sm z-20">
              <div 
                className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:bg-black/5 p-1 sm:p-2 rounded-2xl transition-all min-w-0"
                onClick={() => setShowMembersModal(true)}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden p-0 h-10 w-10 bg-[#3A2C2B]/5 rounded-xl shrink-0" 
                  onClick={(e) => { e.stopPropagation(); setShowSidebar(true); }}
                >
                  <ChevronLeft className="w-6 h-6 text-[#3A2C2B]" />
                </Button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#3A2C2B] text-white flex items-center justify-center font-black shrink-0 shadow-md">
                  {activeConv.metadata?.icon || activeConv.title[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-xs sm:text-lg text-[#3A2C2B] leading-tight truncate uppercase tracking-tight">{activeConv.title}</h3>
                  <p className="text-[8px] sm:text-[10px] font-bold text-brand-green uppercase tracking-widest flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                    {activeConv.type === 'DIRECT' ? 'Online' : `${activeConv.participants.length} Members`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 pr-2 sm:pr-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-10 h-10 rounded-xl text-muted-foreground hover:bg-[#3A2C2B]/5 hover:text-[#3A2C2B]"
                  onClick={() => setShowMembersModal(true)}
                >
                  <Users className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-2 sm:p-8 space-y-4 sm:space-y-6 scrollbar-hide relative"
              style={{ 
                backgroundImage: 'url("file:///C:/Users/user/.gemini/antigravity/brain/256cc838-26d2-4beb-ad98-76c4141b1455/whatsapp_chat_wallpaper_1778310333892.png")',
                backgroundSize: '300px sm:400px',
                backgroundRepeat: 'repeat'
              }}
              onClick={() => setContextMenuMsgId(null)}
            >
              <div className="absolute inset-0 bg-transparent sm:bg-white/70 pointer-events-none" />
              
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[70%] group relative", 
                      isMe ? "ml-auto items-end" : "mr-auto items-start",
                      contextMenuMsgId === msg.id && "z-[60]"
                    )}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-black uppercase text-muted-foreground mb-1 ml-4">{msg.senderName}</span>
                    )}
                    <div 
                      className={cn(
                        "p-3 sm:p-4 px-4 sm:px-6 rounded-[20px] shadow-sm relative transition-all w-fit min-w-[80px]", 
                        isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-foreground rounded-tl-none border border-border/50",
                        contextMenuMsgId === msg.id && "ring-4 ring-primary/20 scale-[0.98]"
                      )}
                    >
                      {msg.type === 'FILE' ? (
                        <div className="flex items-center gap-3 py-1">
                          <div className={cn("p-2 rounded-xl", isMe ? "bg-white/20" : "bg-primary/10 text-primary")}>
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[200px]">{msg.content}</p>
                            <p className={cn("text-[9px] font-bold uppercase opacity-60", isMe ? "text-white" : "text-muted-foreground")}>Document • 2.4 MB</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium pr-6">{msg.content}</p>
                      )}

                      {/* Dropdown Trigger Arrow */}
                      <button 
                        className={cn(
                          "absolute top-2 right-2 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100",
                          isMe ? "text-white/80 hover:bg-white/20" : "text-muted-foreground hover:bg-black/5",
                          contextMenuMsgId === msg.id && "opacity-100 rotate-180"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuMsgId(contextMenuMsgId === msg.id ? null : msg.id);
                        }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <div className={cn("flex items-center gap-1 mt-2 text-[9px] font-bold uppercase", isMe ? "text-white/60" : "text-muted-foreground")}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-brand-blue" />}
                      </div>

                      {/* Context Menu Dropdown */}
                      {contextMenuMsgId === msg.id && (
                        <div 
                          className={cn(
                            "absolute z-[100] w-[160px] sm:w-[180px] bg-white border border-border/40 rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200",
                            isMe 
                              ? "right-0 sm:right-[calc(100%+8px)] top-full sm:top-0 mt-2 sm:mt-0" 
                              : "left-0 sm:left-[calc(100%+8px)] top-full sm:top-0 mt-2 sm:mt-0"
                          )}
                        >
                          <div className="py-2 max-h-[280px] overflow-y-auto scrollbar-hide">
                            <button className="w-full flex items-center gap-4 px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground/80 hover:bg-secondary/30 transition-all uppercase tracking-wider"><Reply className="w-4 h-4 opacity-70" /> Reply</button>
                            <button className="w-full flex items-center gap-4 px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground/80 hover:bg-secondary/30 transition-all uppercase tracking-wider"><Copy className="w-4 h-4 opacity-70" /> Copy</button>
                            <button className="w-full flex items-center gap-4 px-5 py-2.5 text-xs sm:text-sm font-medium text-destructive/80 hover:bg-destructive/5 transition-all uppercase tracking-wider"><Trash2 className="w-4 h-4 opacity-70" /> Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2 sm:p-8 pt-2 sm:pt-4 relative z-30">
              {showEmojiPicker && (
                <div className="absolute bottom-[90px] left-4 sm:left-8 bg-white/95 backdrop-blur-md p-4 rounded-[20px] shadow-2xl border border-border/10 w-[280px] sm:w-[320px] max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-hide animate-in slide-in-from-bottom-2 duration-300 z-50">
                  {EMOJI_CATEGORIES.map(cat => (
                    <div key={cat.label} className="mb-4">
                      <p className="text-[8px] sm:text-[9px] font-black uppercase text-muted-foreground mb-3 sticky top-0 bg-white/10 backdrop-blur-sm py-1">{cat.label}</p>
                      <div className="grid grid-cols-6 gap-1">
                        {cat.icons.map(emoji => (
                          <button 
                            key={emoji} 
                            onClick={() => addEmoji(emoji)}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg hover:bg-secondary/50 rounded-lg sm:rounded-xl transition-all hover:scale-110"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="h-14 sm:h-16 bg-white sm:bg-white/40 rounded-xl sm:rounded-2xl border border-border/10 shadow-xl flex items-center px-3 sm:px-4 gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("w-9 h-9 sm:w-10 sm:h-10 transition-colors", showEmojiPicker ? "text-primary bg-primary/10" : "text-muted-foreground")}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-5 h-5" />
                </Button>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 sm:w-10 sm:h-10 text-muted-foreground hidden sm:flex"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none outline-none font-medium text-xs sm:text-sm"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#3A2C2B] text-white shadow-lg shadow-black/10 shrink-0">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"><Users className="w-10 h-10 text-primary" /></div>
            <h2 className="text-2xl font-black mb-2">Select a Chat</h2>
            <p className="text-muted-foreground text-sm max-w-xs">Start a conversation with your class, faculty, or individual teachers.</p>
          </div>
        )}
      </div>

      {/* Group Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title="Group Participants"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 mb-2">
            Tap a member to message them directly
          </p>
          <div className="space-y-2">
            {activeConv?.participants.map(id => {
              const p = getUsers().find(u => u.id === id);
              if (!p) return null;
              return (
                <div 
                  key={id} 
                  className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-primary/20 hover:bg-primary/5 group"
                  onClick={() => startPrivateChat(id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-soft-parchment flex items-center justify-center font-black text-xs text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">{p.name} {p.id === user?.id && "(You)"}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {p.role} {p.metadata?.classId && `• Class ${p.metadata.classId}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Send className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Create Group Modal - Cleaned up scrollbars */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="New Smart Group"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
            <Input placeholder="e.g. Physics 10-A Chat" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="h-12 rounded-2xl" />
          </div>

          <div className="flex p-1 bg-secondary/10 rounded-2xl">
            <button onClick={() => setSelectionMode('FILTER')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", selectionMode === 'FILTER' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}>
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
            <button onClick={() => setSelectionMode('INDIVIDUAL')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", selectionMode === 'INDIVIDUAL' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}>
              <UserPlus2 className="w-3.5 h-3.5" /> People
            </button>
          </div>

          {selectionMode === 'FILTER' ? (
            <div className="space-y-4">
              <MultiSelect label="Roles" value={targetRoles} onChange={setTargetRoles} options={[{ label: 'Teachers', value: 'TEACHER' }, { label: 'Students', value: 'STUDENT' }, { label: 'Parents', value: 'PARENT' }]} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Class" value={targetClass} onChange={setTargetClass} options={[{ label: 'All', value: 'ALL' }, { label: 'Class 10', value: '10-A' }, { label: 'Class 11', value: '11-B' }, { label: 'Class 8', value: '8-C' }]} />
                <Select label="Section" value={targetSection} onChange={setTargetSection} options={[{ label: 'All', value: 'ALL' }, { label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }]} />
              </div>
              <Select label="Department" value={targetDepartment} onChange={setTargetDepartment} options={[{ label: 'All', value: 'ALL' }, { label: 'Science', value: 'SCIENCE' }, { label: 'Math', value: 'MATH' }]} />
              <div className="p-4 bg-brand-green/5 rounded-2xl border border-brand-green/20">
                <p className="text-[9px] font-black text-brand-green uppercase mb-1">Preview</p>
                <p className="text-sm font-bold text-brand-green">{resolvedParticipants.length} members found</p>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <RecipientSelector 
                availableRecipients={recipients} 
                selectedRecipients={selectedForGroup} 
                onToggle={(id) => setSelectedForGroup(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} 
                onClear={() => setSelectedForGroup([])} 
              />
            </div>
          )}

          <div className="pt-4 sticky bottom-0 bg-white pb-2">
            <Button className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px]" disabled={!newGroupName.trim() || (selectionMode === 'INDIVIDUAL' ? selectedForGroup.length === 0 : resolvedParticipants.length === 0)} onClick={handleCreateGroupWithFilters}>
              Create Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage;
