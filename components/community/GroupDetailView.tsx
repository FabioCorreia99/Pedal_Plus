import {
    ArrowLeft,
    Heart,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Send,
    Share2,
    Users
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';
// Certifica-te que tens navegação configurada ou usa props
import { useNavigation, useRoute } from '@react-navigation/native';

const COLORS = { 
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A", 
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF",
  red: "#ef4444"
};

interface GroupDetailProps {
  groupId: string; // Recebido via props ou route params
  onBack?: () => void; // Opcional se usar react-navigation
}

interface PostItem {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    username: string; // Adicionado username
    avatar_url: string;
  };
  likes_count: number;
  user_has_liked: boolean;
}

export default function GroupDetailView({ groupId: propGroupId, onBack }: GroupDetailProps) {
  // Se usar React Navigation, pegar o ID dos params
  const route = useRoute<any>();
  const navigation = useNavigation();
  const groupId = propGroupId || route.params?.groupId;

  const [group, setGroup] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estado para guardar a imagem e nome do user atual
  const [userProfile, setUserProfile] = useState<{ avatar_url: string | null, full_name: string | null } | null>(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      // 1. Obter Utilizador Atual
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (user) {
        // Buscar perfil do utilizador para ter a imagem correta no input
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);
      }

      // 2. Buscar Info do Grupo
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // 3. Contar Membros
      const { count, error: countError } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);
      
      if (!countError) setMemberCount(count || 0);

      // 4. Verificar se é membro
      if (user) {
        const { data: memberData } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();
        setIsMember(!!memberData);
      }

      // 5. Buscar Posts
      await fetchPosts(user?.id);

    } catch (error) {
      console.error('Erro ao buscar detalhes do grupo:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do grupo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPosts = async (currentUserId: string | undefined) => {
    try {
      // Usa a relação explícita para evitar o erro PGRST201
      const { data, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          profiles:profiles!group_posts_user_id_fkey (full_name, username, avatar_url),
          group_post_likes (user_id)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar dados
      const processedPosts = data.map((post: any) => ({
        ...post,
        likes_count: post.group_post_likes?.length || 0,
        user_has_liked: post.group_post_likes?.some((like: any) => like.user_id === currentUserId),
        profiles: post.profiles || { full_name: null, username: 'Utilizador Desconhecido', avatar_url: null }
      }));

      setPosts(processedPosts);
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
    }
  };

  // --- NOVA LÓGICA DE APAGAR GRUPO ---
  const deleteGroup = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      Alert.alert("Grupo Eliminado", "O grupo foi apagado com sucesso.");
      
      // Voltar para a lista anterior
      if (onBack) onBack();
      else navigation.goBack();

    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível apagar o grupo: " + error.message);
    }
  };

  const handleJoinLeave = async () => {
    if (!userId) return;

    // VERIFICAÇÃO DE ADMIN (DONO)
    if (isMember && group?.owner_id === userId) {
      Alert.alert(
        "Apagar Grupo?",
        "Como administrador, ao saíres do grupo irás apagá-lo permanentemente para todos os membros. Desejas continuar?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Sim, Apagar Tudo", 
            style: "destructive", 
            onPress: deleteGroup 
          }
        ]
      );
      return;
    }

    try {
      if (isMember) {
        // Sair do Grupo
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', userId);
        
        if (error) throw error;
        setIsMember(false);
        setMemberCount(prev => prev - 1);
      } else {
        // Juntar ao Grupo
        const { error } = await supabase
          .from('group_members')
          .insert({ group_id: groupId, user_id: userId, role: 'member' });
        
        if (error) throw error;
        setIsMember(true);
        setMemberCount(prev => prev + 1);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() || !userId) return;
    setPosting(true);

    try {
      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          user_id: userId,
          content: newPostText.trim()
        });

      if (error) throw error;

      setNewPostText('');
      // Atualizar posts
      await fetchPosts(userId);

    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível criar a publicação.');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string, hasLiked: boolean) => {
    if (!userId) return;

    // Atualização Otimista
    setPosts(currentPosts => 
      currentPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes_count: hasLiked ? p.likes_count - 1 : p.likes_count + 1,
            user_has_liked: !hasLiked
          };
        }
        return p;
      })
    );

    try {
      if (hasLiked) {
        await supabase
          .from('group_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('group_post_likes')
          .insert({ post_id: postId, user_id: userId });
      }
    } catch (error) {
      console.error('Erro no like:', error);
      // Reverter se falhar
      fetchPosts(userId); 
    }
  };

  // Alterei renderHeader para uma variável JSX para evitar re-renderizações desnecessárias na FlatList
  const headerComponent = (
    <View>
      {/* IMAGEM DE CAPA */}
      <View style={styles.coverContainer}>
        <Image 
          source={{ uri: group?.photo_url || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800&fit=crop' }} 
          style={styles.coverImage} 
        />
        <View style={styles.coverOverlay} />
        
        {/* Header de Navegação Absoluto */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack || (() => navigation.goBack())} style={styles.iconBtn}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreHorizontal color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Info do Grupo Overlay */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{group?.name}</Text>
          <View style={styles.statsRow}>
            <Users size={16} color="white" />
            <Text style={styles.headerStats}>{memberCount} Membros</Text>
            <Text style={styles.headerDot}>•</Text>
            <MapPin size={16} color="white" />
            <Text style={styles.headerStats}>Porto, PT</Text>
          </View>
        </View>
      </View>

      {/* DESCRIÇÃO E AÇÃO */}
      <View style={styles.infoSection}>
        <Text style={styles.descriptionText}>
          {group?.description || "Sem descrição disponível."}
        </Text>
        
        {/* BOTÃO ADAPTATIVO */}
        <TouchableOpacity 
          style={[styles.joinBtn, isMember ? styles.leaveBtn : {}]}
          onPress={handleJoinLeave}
        >
          <Text style={[styles.joinBtnText, isMember ? styles.leaveBtnText : {}]}>
            {isMember ? "Deixar o grupo" : "Aderir ao grupo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ÁREA DE CRIAR POST (Apenas se for membro) */}
      {isMember && (
        <View style={styles.createPostContainer}>
          <Image 
            // IMAGEM REAL DO UTILIZADOR LOGADO
            source={{ uri: userProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' }} 
            style={styles.userAvatarSmall} 
          />
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Escreve algo para o grupo..."
              placeholderTextColor={COLORS.textGray}
              style={styles.postInput}
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
            />
            {newPostText.length > 0 && (
              <TouchableOpacity onPress={handleCreatePost} disabled={posting}>
                {posting ? (
                  <ActivityIndicator size="small" color={COLORS.primaryGreen} />
                ) : (
                  <Send size={20} color={COLORS.primaryGreen} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* TÍTULO DO FEED */}
      <Text style={styles.feedTitle}>Feed da Comunidade</Text>
    </View>
  );

  const renderPost = ({ item }: { item: PostItem }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image 
          // IMAGEM REAL DO AUTOR DO POST
          source={{ uri: item.profiles.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' }} 
          style={styles.postAvatar} 
        />
        <View>
          <Text style={styles.postAuthor}>
            {item.profiles.full_name || item.profiles.username || 'Utilizador Desconhecido'}
          </Text>
          <Text style={styles.postTime}>{new Date(item.created_at).toLocaleDateString('pt-PT')}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => handleLikePost(item.id, item.user_has_liked)}
        >
          <Heart 
            size={20} 
            color={item.user_has_liked ? COLORS.red : COLORS.textGray} 
            fill={item.user_has_liked ? COLORS.red : 'transparent'} 
          />
          <Text style={[styles.actionText, item.user_has_liked && {color: COLORS.red}]}>
            {item.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={20} color={COLORS.textGray} />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Share2 size={20} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        // SOLUÇÃO DO BUG: Passar a variável diretamente em vez da função
        ListHeaderComponent={headerComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchGroupDetails();
          }} tintColor={COLORS.primaryGreen} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        // Isto ajuda a manter o scroll estável quando o teclado abre
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F6', // Fundo ligeiramente cinza para destacar os posts
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // CAPA
  coverContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  navHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStats: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  headerDot: {
    color: 'white',
    marginHorizontal: 10,
  },

  // SECÇÃO DE INFO
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  joinBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  leaveBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444', // Vermelho para indicar saída
    shadowOpacity: 0,
    elevation: 0,
  },
  joinBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leaveBtnText: {
    color: '#ef4444', // Texto vermelho
  },

  // CRIAR POST
  createPostContainer: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  userAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  postInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkText,
    maxHeight: 80,
  },

  // FEED
  feedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginLeft: 20,
    marginBottom: 12,
    marginTop: 10,
  },
  postCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.textGray,
    fontWeight: '500',
  },
});