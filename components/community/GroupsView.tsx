import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  Modal, // Essencial para cobrir o ecrã inteiro sem Router
  Dimensions
} from 'react-native';
import { Filter, Plus, Users } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

import CreateGroupView from './CreateGroupView';
import GroupDetailView from './GroupDetailView';

const COLORS = { 
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A", 
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF"
};

const PAGE_SIZE = 10;

interface GroupItem {
  id: string;
  name: string;
  description: string;
  photo_url: string;
  owner_id?: string;
}

export default function GroupsView() {
  const [myGroups, setMyGroups] = useState<GroupItem[]>([]);
  const [allGroups, setAllGroups] = useState<GroupItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // ESTADOS DE NAVEGAÇÃO
  const [isCreating, setIsCreating] = useState(false);
  // Quando este estado tem um ID, a "Página" de detalhe abre
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Buscar "Os Meus Grupos"
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
          const groupsList = memberData.map((item: any) => item.groups).filter(Boolean);
          setMyGroups(groupsList);
        }
      }

      // 2. Buscar "Todos os Grupos"
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

  // NAVEGAÇÃO: Abre o modal de detalhe
  const openGroupDetail = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        <Text style={styles.loadingText}>A carregar comunidades...</Text>
      </View>
    );
  }

  // --- EMPTY STATE (Sem grupos na app) ---
  if (allGroups.length === 0 && myGroups.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.subHeaderRow}>
          <Text style={styles.subHeaderTitle}>Grupos</Text>
          <TouchableOpacity onPress={() => setIsCreating(true)} style={styles.createMiniBtn}>
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
            Parece que ainda não há comunidades. Seja o primeiro a criar um!
          </Text>
          <TouchableOpacity 
            style={styles.createMainBtn}
            onPress={() => setIsCreating(true)}
            activeOpacity={0.8}
          >
            <Plus size={20} color="white" style={{marginRight: 8}} />
            <Text style={styles.createMainBtnText}>Criar um Grupo</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Criação */}
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
      
      {/* --- SECÇÃO 1: OS MEUS GRUPOS --- */}
      {myGroups.length > 0 && (
        <View style={styles.myGroupsSection}>
          <View style={styles.subHeaderRow}>
            <Text style={styles.subHeaderTitle}>Os Teus Grupos</Text>
            <TouchableOpacity onPress={() => setIsCreating(true)}>
               <Plus size={20} color={COLORS.primaryOrange} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.myGroupsScroll}>
            {myGroups.map(g => (
              <TouchableOpacity 
                key={g.id} 
                style={styles.myGroupCard} 
                activeOpacity={0.8} 
                onPress={() => openGroupDetail(g.id)}
              >
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

      {/* --- SECÇÃO 2: DESCOBRIR GRUPOS --- */}
      <View style={styles.allGroupsSection}>
        <View style={styles.subHeaderRow}>
          <Text style={styles.subHeaderTitle}>Descobrir Grupos</Text>
          
          <View style={styles.actionsRow}>
            {myGroups.length === 0 && (
              <TouchableOpacity onPress={() => setIsCreating(true)} style={styles.createMiniBtn}>
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
              <TouchableOpacity 
                key={g.id} 
                style={styles.listItem} 
                activeOpacity={0.7} 
                onPress={() => openGroupDetail(g.id)}
              >
                <Image 
                  source={{ uri: g.photo_url || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=200&auto=format&fit=crop' }} 
                  style={styles.listImage} 
                  resizeMode="cover"
                />
                <View style={styles.textWrapper}>
                    <Text style={styles.listItemTitle}>{g.name}</Text>
                    <Text style={styles.listItemDesc} numberOfLines={2}>
                      {g.description || 'Sem descrição.'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.joinBtn} onPress={() => openGroupDetail(g.id)}>
                   <Text style={styles.joinBtnText}>Ver</Text>
                </TouchableOpacity>
              </TouchableOpacity>
          ))}
        </View>

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
        
        <View style={{height: 20}} />
      </View>

      {/* --- MODAL DE CRIAÇÃO --- */}
      <CreateGroupView 
        visible={isCreating}
        onClose={() => setIsCreating(false)}
        onGroupCreated={initializeData}
      />

      {/* --- PÁGINA DE DETALHE (SIMULADA COM MODAL FULLSCREEN) --- */}
      {/* Isto garante que cobre a barra de pesquisa e o cabeçalho antigo */}
      <Modal
        visible={!!selectedGroupId}
        animationType="slide"
        presentationStyle="fullScreen" 
        onRequestClose={() => setSelectedGroupId(null)}
      >
        {selectedGroupId && (
          <GroupDetailView 
            groupId={selectedGroupId} 
            onBack={() => {
              setSelectedGroupId(null); // Fecha a "página"
              initializeData(); // Atualiza (caso tenhas entrado num grupo)
            }} 
          />
        )}
      </Modal>

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
    borderRadius: 32,
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
    borderRadius: 16, 
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
    backgroundColor: '#EAFDF2',
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