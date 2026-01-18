import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { 
  ArrowLeft, 
  Send, 
  MoreHorizontal, 
  MessageCircle,
  Clock
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

// --- CORES ---
const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF",
  border: "#E5E7EB"
};

// Interfaces
interface Profile {
  full_name: string;
  username: string;
  avatar_url: string;
}

interface CommentItem {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: Profile;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: Profile;
  likes_count: number;
}

interface PostDetailViewProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
}

export default function PostDetailView({ visible, post, onClose }: PostDetailViewProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (visible && post) {
      fetchComments();
      getUser();
    }
  }, [visible, post]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Buscar perfil para ter a imagem correta no input
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      setCurrentUser({ ...user, avatar_url: data?.avatar_url });
    }
  };

  const fetchComments = async () => {
    if (!post) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_post_comments')
        .select(`
          *,
          profiles (full_name, username, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true }); // Comentários mais antigos no topo

      if (error) throw error;

      // Sanitizar dados
      const cleanComments = data.map((item: any) => ({
        ...item,
        profiles: item.profiles || { full_name: 'Utilizador', username: 'anon', avatar_url: null }
      }));

      setComments(cleanComments);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !post || !currentUser) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('group_post_comments')
        .insert({
          post_id: post.id,
          user_id: currentUser.id,
          content: commentText.trim()
        });

      if (error) throw error;

      setCommentText('');
      fetchComments(); // Recarregar para mostrar o novo comentário

    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // HEADER DO POST (O post original)
  const renderHeader = () => {
    if (!post) return null;
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image 
            source={{ uri: post.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' }} 
            style={styles.avatarLarge} 
          />
          <View style={{flex: 1}}>
            <Text style={styles.authorName}>
              {post.profiles?.full_name || post.profiles?.username || 'Utilizador'}
            </Text>
            <View style={styles.timeRow}>
              <Clock size={12} color={COLORS.textGray} />
              <Text style={styles.timeText}>{formatTime(post.created_at)}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <MoreHorizontal size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{post.content}</Text>

        <View style={styles.statsDivider}>
          <Text style={styles.statsText}>
            {post.likes_count} Gostos • {comments.length} Comentários
          </Text>
        </View>
      </View>
    );
  };

  // ITEM DE COMENTÁRIO
  const renderComment = ({ item }: { item: CommentItem }) => (
    <View style={styles.commentItem}>
      <Image 
        source={{ uri: item.profiles.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' }} 
        style={styles.avatarSmall} 
      />
      <View style={styles.commentBubble}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>
            {item.profiles.full_name || item.profiles.username}
          </Text>
          <Text style={styles.commentTime}>{formatTime(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // Estilo iOS "Sheet" ou FullScreen
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Publicação</Text>
          <View style={{width: 24}} /> 
        </View>

        {/* CONTENT */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyState}>
                  <MessageCircle size={40} color={COLORS.textGray} />
                  <Text style={styles.emptyText}>Ainda sem comentários. Sê o primeiro!</Text>
                </View>
              ) : null
            }
          />

          {/* INPUT BAR */}
          <View style={styles.inputContainer}>
            <Image 
              source={{ uri: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' }} 
              style={styles.avatarInput} 
            />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Escreve um comentário..."
                placeholderTextColor={COLORS.textGray}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              {commentText.length > 0 && (
                <TouchableOpacity 
                  onPress={handleSendComment} 
                  disabled={sending}
                  style={styles.sendBtn}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={COLORS.primaryGreen} />
                  ) : (
                    <Send size={20} color={COLORS.primaryGreen} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  backBtn: {
    padding: 4,
  },

  listContent: {
    paddingBottom: 20,
  },

  // Post Header Section
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textGray,
    marginLeft: 4,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  statsDivider: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  statsText: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '500',
  },

  // Comments
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 12,
    borderTopLeftRadius: 4, // Estilo "Chat"
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  commentTime: {
    fontSize: 10,
    color: COLORS.textGray,
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textGray,
    marginTop: 10,
    fontSize: 14,
  },

  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: COLORS.white,
  },
  avatarInput: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 4, // Alinhar com o input
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.lightGray,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkText,
    maxHeight: 100,
    paddingTop: 8, // Centralizar texto single-line
    paddingBottom: 8,
  },
  sendBtn: {
    marginLeft: 8,
    paddingBottom: 8,
  },
});