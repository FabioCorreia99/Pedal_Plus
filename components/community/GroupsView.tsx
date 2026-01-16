import { Filter, Plus, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase'; // Certifica-te que o caminho está correto

// IMPORTA O COMPONENTE QUE JÁ TENS
import CreateGroupView from './CreateGroupView';

// --- CORES ---
const COLORS = { 
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A", 
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF"
};

const PAGE_SIZE = 10;

// Interface ajustada para a tua tabela (UUID e photo_url)
interface GroupItem {
  id: string; // UUID é string
  name: string;
  description: string;
  photo_url: string; // Tabela usa photo_url
  owner_id?: string;
}

export default function GroupsView() {
  const [myGroups, setMyGroups] = useState<GroupItem[]>([]);
  const [allGroups, setAllGroups] = useState<GroupItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // ESTADO PARA CONTROLAR O MODAL
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Buscar "Meus Grupos" (onde sou membro)
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name,
              description,
              photo_url,
              owner_id
            )
          `)
          .eq('user_id', user.id);

        if (!memberError && memberData) {
          // Flatten os dados
          const groupsList = memberData.map((item: any) => item.groups).filter(Boolean);
          setMyGroups(groupsList);
        }
      }

      // 2. Buscar "Todos os Grupos" (Reset para pagina 0)
      await fetchAllGroups(0, true);

    } catch (err) {
      console.error('Erro ao inicializar grupos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGroups = async (pageNumber: number, reset = false) => {
    try {
      if (!reset) setLoadingMore(true);

      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        setAllGroups(prev => reset ? data : [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error('Erro ao procurar todos os grupos:', err);
    } finally {
      if (!reset) setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAllGroups(page + 1, false);
    }
  };

  // FUNÇÃO PARA ABRIR O MODAL
  const handleCreateGroup = () => {
    setIsCreating(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        <Text style={styles.loadingText}>A carregar comunidades...</Text>
      </View>
    );
  }

  // --- EMPTY STATE GLOBAL (Se não houver NENHUM grupo) ---
  if (allGroups.length === 0 && myGroups.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.subHeaderRow}>
          <Text style={styles.subHeaderTitle}>Grupos</Text>
          <TouchableOpacity onPress={handleCreateGroup} style={styles.createMiniBtn}>
              <Plus size={16} color={COLORS.primaryOrange} />
              <Text style={styles.createMiniText}>Criar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Users size={48} color={COLORS.primaryGreen} /> 
          </View>
          <Text style={styles.emptyTitle}>Encontre o seu Grupo</Text>
          <Text style={styles.emptyDesc}>
            Parece que ainda não há comunidades. Seja o primeiro a fazer um!
          </Text>
          <TouchableOpacity 
            style={styles.createMainBtn}
            onPress={handleCreateGroup}
            activeOpacity={0.8}
          >
            <Plus size={20} color="white" style={{marginRight: 8}} />
            <Text style={styles.createMainBtnText}>Criar um Grupo</Text>
          </TouchableOpacity>
        </View>

        {/* MODAL DE CRIAÇÃO */}
        <CreateGroupView 
          visible={isCreating} 
          onClose={() => setIsCreating(false)}
          onGroupCreated={initializeData}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* --- SECÇÃO 1: MY GROUPS (Só aparece se tiver grupos) --- */}
      {myGroups.length > 0 && (
        <View style={styles.myGroupsSection}>
          <View style={styles.subHeaderRow}>
            <Text style={styles.subHeaderTitle}>Os Teus Grupos</Text>
            {/* Atalho para criar */}
            <TouchableOpacity onPress={handleCreateGroup}>
               <Plus size={20} color={COLORS.primaryOrange} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.myGroupsScroll}>
            {myGroups.map(g => (
              <TouchableOpacity key={g.id} style={styles.myGroupCard} activeOpacity={0.8}>
                 <Image 
                    source={{ uri: g.photo_url || 'https://images.unsplash.com/photo-1528696892704-5e1122852276?q=80&w=200&auto=format&fit=crop' }} 
                    style={styles.myGroupImage} 
                  />
                  <Text style={styles.myGroupTitle} numberOfLines={1}>{g.name}</Text>
                  <Text style={styles.myGroupRole} numberOfLines={1}>Membro</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* --- SECÇÃO 2: ALL GROUPS --- */}
      <View style={styles.allGroupsSection}>
        <View style={styles.subHeaderRow}>
          <Text style={styles.subHeaderTitle}>Descobrir Grupos</Text>
          
          <View style={styles.actionsRow}>
            {/* Se não tiver grupos meus, o botão de criar aparece aqui como destaque */}
            {myGroups.length === 0 && (
              <TouchableOpacity onPress={handleCreateGroup} style={styles.createMiniBtn}>
                <Plus size={16} color={COLORS.primaryOrange} />
                <Text style={styles.createMiniText}>Criar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity>
               <Filter size={20} color={COLORS.textGray}/>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listContainer}>
          {allGroups.map(g => (
              <TouchableOpacity key={g.id} style={styles.listItem} activeOpacity={0.7}>
                <Image 
                  source={{ uri: g.photo_url || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=200&auto=format&fit=crop' }} 
                  style={styles.listImage} 
                  resizeMode="cover"
                />
                <View style={styles.textWrapper}>
                    <Text style={styles.listItemTitle}>{g.name}</Text>
                    <Text style={styles.listItemDesc} numberOfLines={2}>
                      {g.description || 'No description provided.'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.joinBtn}>
                   <Text style={styles.joinBtnText}>Ver</Text>
                </TouchableOpacity>
              </TouchableOpacity>
          ))}
        </View>

        {/* --- LOAD MORE BUTTON --- */}
        {hasMore && (
          <TouchableOpacity 
            style={styles.loadMoreBtn} 
            onPress={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color={COLORS.primaryOrange} />
            ) : (
              <Text style={styles.loadMoreText}>Carregar Mais</Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Espaço extra no fundo */}
        <View style={{height: 20}} />
      </View>

      <CreateGroupView 
        visible={isCreating}
        onClose={() => setIsCreating(false)}
        onGroupCreated={() => {
          // Atualiza a lista quando um grupo novo é criado
          initializeData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  
  // Header
  subHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16, 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subHeaderTitle: { 
    fontSize: 18,
    fontWeight: '700', 
    color: COLORS.darkText 
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  createMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  createMiniText: {
    fontSize: 12,
    color: COLORS.primaryOrange,
    fontWeight: '600',
    marginLeft: 4,
  },

  // --- MY GROUPS STYLES ---
  myGroupsSection: {
    marginBottom: 30,
  },
  myGroupsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  myGroupCard: {
    marginRight: 16,
    alignItems: 'center',
    width: 80,
  },
  myGroupImage: {
    width: 64,
    height: 64,
    borderRadius: 32, // Circulo
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    marginBottom: 8,
    backgroundColor: '#eee'
  },
  myGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkText,
    textAlign: 'center',
    width: '100%'
  },
  myGroupRole: {
    fontSize: 10,
    color: COLORS.textGray,
  },

  // --- ALL GROUPS STYLES ---
  allGroupsSection: {
    // flex: 1
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, 
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  listImage: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, // Quadrado arredondado
    backgroundColor: '#eee' 
  },
  textWrapper: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
  },
  listItemTitle: { 
    fontWeight: '700', 
    color: COLORS.darkText,
    fontSize: 16,
    marginBottom: 2,
  },
  listItemDesc: { 
    fontSize: 12, 
    color: COLORS.textGray,
    lineHeight: 16,
  },
  joinBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkText,
  },

  // Pagination Button
  loadMoreBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  loadMoreText: {
    color: COLORS.primaryOrange,
    fontWeight: '600',
    fontSize: 14,
  },

  // Loading
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textGray,
    fontSize: 14
  },

  // --- EMPTY STATE ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EAFDF2', // Verde muito claro (fundo do icone)
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createMainBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});