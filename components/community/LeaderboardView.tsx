import { Crown, Trophy, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase'; // Confirma se o caminho está correto

const { width } = Dimensions.get('window');

// --- CORES DO TEMA ---
const COLORS = { 
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  teal: "#35C2C1",
  bgLightGreen: "#F0FDF4",
  textDark: "#1A1A1A",
  textGray: "#9ca3af",
  white: "#FFFFFF"
};

// Interface para os dados vindos do Supabase
interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  img: string;
  isMe: boolean;
}

export default function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const [timeFrame, setTimeFrame] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Imagem padrão caso o user não tenha avatar
  const DEFAULT_AVATAR = "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg";

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // 1. Obter o utilizador atual para saber quem sou "eu"
      const { data: { user } } = await supabase.auth.getUser();
      const myId = user?.id;

      // 2. Buscar perfis ordenados por pontos
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_points, avatar_url')
        .order('total_points', { ascending: false })
        .limit(50); // Buscar top 50

      if (error) throw error;

      if (data) {
        // 3. Formatar os dados para a UI
        const formattedData: LeaderboardUser[] = data.map((profile, index) => ({
          id: profile.id,
          rank: index + 1,
          name: profile.username || 'Utilizador',
          points: profile.total_points || 0,
          img: profile.avatar_url || DEFAULT_AVATAR,
          isMe: profile.id === myId
        }));

        setLeaderboardData(formattedData);
      }
    } catch (error) {
      console.error("Erro ao buscar leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Separar Top 3 do resto da lista com segurança
  const firstPlace = leaderboardData[0];
  const secondPlace = leaderboardData[1];
  const thirdPlace = leaderboardData[2];
  const restOfList = leaderboardData.slice(3);

  return (
    <View style={styles.container}>
      {/* 1. HEADER (Fixo no Topo) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Tabela de Classificação</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. LOADING STATE */}
      {loading ? (
        <View style={[styles.contentContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      ) : (
        /* 3. CONTEÚDO SCROLLÁVEL */
        <View style={styles.contentContainer}>
          {/* Fundo decorativo verde claro para o pódio */}
          <View style={styles.podiumBackground}>
             
             {/* PÓDIO (TOP 3) - Só renderiza se houver dados suficientes */}
             <View style={styles.podiumContainer}>
               
               {/* 2º Lugar (Esquerda) */}
               {secondPlace && (
                 <View style={[
                    styles.podiumColumn, 
                    { marginTop: 40 },
                    secondPlace.isMe && styles.podiumColumnMe // Aplica estilo verde se for "Eu"
                  ]}>
                    <View style={styles.customIconContainer}>
                       <Trophy size={24} color={secondPlace.isMe ? 'white' : COLORS.primaryOrange} fill={secondPlace.isMe ? 'white' : COLORS.primaryOrange} />
                    </View>
                    
                    <View style={[styles.avatarRing, { borderColor: secondPlace.isMe ? 'white' : COLORS.primaryOrange }]}>
                       <Image source={{ uri: secondPlace.img }} style={styles.avatarImage} />
                       <View style={[styles.rankBadge, { backgroundColor: secondPlace.isMe ? 'white' : COLORS.primaryOrange }]}>
                          <Text style={[styles.rankText, secondPlace.isMe && { color: COLORS.primaryGreen }]}>2</Text>
                       </View>
                    </View>
                    
                    <Text style={[styles.podiumName, secondPlace.isMe && { color: 'white' }]} numberOfLines={1}>
                      {secondPlace.name}
                    </Text>
                    <Text style={[styles.podiumScore, secondPlace.isMe && { color: 'white' }]}>
                      {secondPlace.points}<Text style={[styles.unitText, secondPlace.isMe && { color: 'rgba(255,255,255,0.8)' }]}>pts</Text>
                    </Text>
                 </View>
               )}
 
               {/* 1º Lugar (Centro - Mais alto) */}
               {firstPlace && (
                 <View style={[
                    styles.podiumColumn, 
                    { marginTop: 0 },
                    firstPlace.isMe && styles.podiumColumnMe
                  ]}>
                    <View style={styles.customIconContainer}>
                       <Crown size={32} color={firstPlace.isMe ? 'white' : COLORS.primaryGreen} fill={firstPlace.isMe ? 'white' : COLORS.primaryGreen} />
                    </View>
                    
                    <View style={[styles.avatarRingLarge, { borderColor: firstPlace.isMe ? 'white' : COLORS.primaryGreen }]}>
                       <Image source={{ uri: firstPlace.img }} style={styles.avatarImageLarge} />
                       <View style={[styles.rankBadgeLarge, { backgroundColor: firstPlace.isMe ? 'white' : COLORS.primaryGreen }]}>
                          <Text style={[styles.rankTextLarge, firstPlace.isMe && { color: COLORS.primaryGreen }]}>1</Text>
                       </View>
                    </View>
                    
                    <Text style={[styles.podiumNameLarge, firstPlace.isMe && { color: 'white' }]} numberOfLines={1}>
                      {firstPlace.name}
                    </Text>
                    <Text style={[styles.podiumScoreLarge, firstPlace.isMe && { color: 'white' }]}>
                      {firstPlace.points}<Text style={[styles.unitText, firstPlace.isMe && { color: 'rgba(255,255,255,0.8)' }]}>pts</Text>
                    </Text>
                 </View>
               )}
 
               {/* 3º Lugar (Direita) */}
               {thirdPlace && (
                 <View style={[
                    styles.podiumColumn, 
                    { marginTop: 60 },
                    thirdPlace.isMe && styles.podiumColumnMe
                  ]}>
                    <View style={styles.customIconContainer}>
                       <Trophy size={24} color={thirdPlace.isMe ? 'white' : COLORS.teal} fill={thirdPlace.isMe ? 'white' : COLORS.teal} />
                    </View>
                    
                    <View style={[styles.avatarRing, { borderColor: thirdPlace.isMe ? 'white' : COLORS.teal }]}>
                       <Image source={{ uri: thirdPlace.img }} style={styles.avatarImage} />
                       <View style={[styles.rankBadge, { backgroundColor: thirdPlace.isMe ? 'white' : COLORS.teal }]}>
                          <Text style={[styles.rankText, thirdPlace.isMe && { color: COLORS.primaryGreen }]}>3</Text>
                       </View>
                    </View>
                    
                    <Text style={[styles.podiumName, thirdPlace.isMe && { color: 'white' }]} numberOfLines={1}>
                      {thirdPlace.name}
                    </Text>
                    <Text style={[styles.podiumScore, thirdPlace.isMe && { color: 'white' }]}>
                      {thirdPlace.points}<Text style={[styles.unitText, thirdPlace.isMe && { color: 'rgba(255,255,255,0.8)' }]}>pts</Text>
                    </Text>
                 </View>
               )}
 
             </View>
          </View>
 
          {/* LISTA RESTANTE (Sheet branca arredondada) */}
          <View style={styles.listSheet}>
             
             {/* Seletor de Tempo */}
             <View style={styles.toggleContainer}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, timeFrame === 'Weekly' ? styles.toggleBtnActive : null]}
                  onPress={() => setTimeFrame('Weekly')}
                >
                   <Text style={[styles.toggleText, timeFrame === 'Weekly' ? styles.toggleTextActive : styles.toggleTextInactive]}>Semanal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.toggleBtn, timeFrame === 'Monthly' ? styles.toggleBtnActive : null]}
                  onPress={() => setTimeFrame('Monthly')}
                >
                   <Text style={[styles.toggleText, timeFrame === 'Monthly' ? styles.toggleTextActive : styles.toggleTextInactive]}>Mensal</Text>
                </TouchableOpacity>
             </View>
 
             {/* Lista de Utilizadores */}
             <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {restOfList.length > 0 ? (
                  restOfList.map((user) => (
                    <View 
                      key={user.id} 
                      style={[
                        styles.listItem, 
                        user.isMe ? styles.listItemMe : null
                      ]}
                    >
                      <Text style={[styles.listRank, user.isMe ? { color: 'white' } : { color: COLORS.textDark }]}>
                          {user.rank}
                      </Text>
                      
                      <Image source={{ uri: user.img }} style={styles.listAvatar} />
                      
                      <Text style={[styles.listName, user.isMe ? { color: 'white' } : { color: COLORS.textDark }]}>
                          {user.name}
                      </Text>
                      
                      <Text style={[styles.listScore, user.isMe ? { color: 'white' } : { color: COLORS.textGray }]}>
                          {user.points} <Text style={{fontSize: 12, fontWeight: 'normal'}}>pts</Text>
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                    Não há mais utilizadores no ranking.
                  </Text>
                )}
             </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 100, 
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 10,
    backgroundColor: COLORS.primaryGreen,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeBtn: {
    padding: 4,
  },
  
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.bgLightGreen,
  },
  
  // PÓDIO
  podiumBackground: {
    backgroundColor: COLORS.bgLightGreen,
    paddingBottom: 30, 
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 10,
    gap: 10,
    minHeight: 220, 
  },
  podiumColumn: {
    alignItems: 'center',
    width: width * 0.28, // Um pouco mais largo para acomodar o card "Me"
    paddingVertical: 10,
    borderRadius: 16,
  },
  // ESTILO ESPECIAL PARA O USER NO PODIO
  podiumColumnMe: {
    backgroundColor: COLORS.primaryGreen,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 5,
  },

  customIconContainer: {
    marginBottom: 8,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Avatares
  avatarRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    padding: 0, 
    backgroundColor: 'white',
    marginBottom: 8,
    position: 'relative',
  },
  avatarRingLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    padding: 0,
    backgroundColor: 'white',
    marginBottom: 8,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#eee', 
  },
  avatarImageLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    backgroundColor: '#eee',
  },
  
  // Badges
  rankBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  rankBadgeLarge: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rankTextLarge: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Textos
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  podiumNameLarge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  podiumScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primaryGreen,
  },
  podiumScoreLarge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryGreen,
  },
  unitText: {
    fontSize: 10,
    fontWeight: 'normal',
    color: COLORS.textGray,
    marginLeft: 2,
  },

  // LISTA (SHEET BRANCA)
  listSheet: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    elevation: 5,
  },
  
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', 
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.textDark,
  },
  toggleTextInactive: {
    color: COLORS.textGray,
  },

  scrollContent: {
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  listItemMe: {
    backgroundColor: COLORS.primaryGreen,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  listRank: {
    width: 24,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#eee',
  },
  listName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  listScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});