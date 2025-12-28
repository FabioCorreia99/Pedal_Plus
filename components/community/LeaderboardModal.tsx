import { Crown, Trophy, X } from 'lucide-react-native'; // Usar ícones padrão ou substituir por imagens customizadas
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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

// --- DADOS MOCKADOS (TOP 3 + RESTO) ---
const LEADERBOARD_DATA = [
  { rank: 1, name: "Bryan Wolf", km: 43, img: "https://randomuser.me/api/portraits/men/32.jpg", color: COLORS.primaryGreen },
  { rank: 2, name: "Meghan Jes...", km: 40, img: "https://randomuser.me/api/portraits/women/44.jpg", color: COLORS.primaryOrange },
  { rank: 3, name: "Alex Turner", km: 38, img: "https://randomuser.me/api/portraits/men/22.jpg", color: COLORS.teal },
  { rank: 4, name: "Marsha Fisher", km: 36, img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { rank: 5, name: "Juanita Cormier", km: 35, img: "https://randomuser.me/api/portraits/women/12.jpg" },
  { rank: 6, name: "Tu", km: 34, img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop", isMe: true },
  { rank: 7, name: "Tamara Schmidt", km: 33, img: "https://randomuser.me/api/portraits/women/2.jpg" },
  { rank: 8, name: "John Doe", km: 32, img: "https://randomuser.me/api/portraits/men/45.jpg" },
  { rank: 9, name: "Jane Smith", km: 30, img: "https://randomuser.me/api/portraits/women/50.jpg" },
];

export default function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const [timeFrame, setTimeFrame] = useState<'Weekly' | 'Monthly'>('Weekly');

  return (
    <View style={styles.container}>
      {/* 1. HEADER (Fixo no Topo) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. CONTEÚDO SCROLLÁVEL */}
      <View style={styles.contentContainer}>
        {/* Fundo decorativo verde claro para o pódio */}
        <View style={styles.podiumBackground}>
           
           {/* PÓDIO (TOP 3) */}
           <View style={styles.podiumContainer}>
              
              {/* 2º Lugar (Esquerda) */}
              <View style={[styles.podiumColumn, { marginTop: 40 }]}>
                 {/* Ícone Customizado (Mão/Troféu) */}
                 <View style={styles.customIconContainer}>
                    {/* Substituir este Trophy por <Image source={require('path/to/hand.png')} ... /> */}
                    <Trophy size={24} color={COLORS.primaryOrange} fill={COLORS.primaryOrange} />
                 </View>
                 
                 <View style={[styles.avatarRing, { borderColor: COLORS.primaryOrange }]}>
                    <Image source={{ uri: LEADERBOARD_DATA[1].img }} style={styles.avatarImage} />
                    <View style={[styles.rankBadge, { backgroundColor: COLORS.primaryOrange }]}>
                       <Text style={styles.rankText}>2</Text>
                    </View>
                 </View>
                 
                 <Text style={styles.podiumName} numberOfLines={1}>{LEADERBOARD_DATA[1].name}</Text>
                 <Text style={styles.podiumScore}>{LEADERBOARD_DATA[1].km}<Text style={styles.unitText}>km</Text></Text>
              </View>

              {/* 1º Lugar (Centro - Mais alto) */}
              <View style={[styles.podiumColumn, { marginTop: 0 }]}>
                 {/* Ícone Customizado (Coroa) */}
                 <View style={styles.customIconContainer}>
                    <Crown size={32} color={COLORS.primaryGreen} fill={COLORS.primaryGreen} />
                 </View>
                 
                 <View style={[styles.avatarRingLarge, { borderColor: COLORS.primaryGreen }]}>
                    <Image source={{ uri: LEADERBOARD_DATA[0].img }} style={styles.avatarImageLarge} />
                    <View style={[styles.rankBadgeLarge, { backgroundColor: COLORS.primaryGreen }]}>
                       <Text style={styles.rankTextLarge}>1</Text>
                    </View>
                 </View>
                 
                 <Text style={styles.podiumNameLarge} numberOfLines={1}>{LEADERBOARD_DATA[0].name}</Text>
                 <Text style={styles.podiumScoreLarge}>{LEADERBOARD_DATA[0].km}<Text style={styles.unitText}>km</Text></Text>
              </View>

              {/* 3º Lugar (Direita) */}
              <View style={[styles.podiumColumn, { marginTop: 60 }]}>
                 {/* Ícone Customizado (Mão/Troféu) */}
                 <View style={styles.customIconContainer}>
                    <Trophy size={24} color={COLORS.teal} fill={COLORS.teal} />
                 </View>
                 
                 <View style={[styles.avatarRing, { borderColor: COLORS.teal }]}>
                    <Image source={{ uri: LEADERBOARD_DATA[2].img }} style={styles.avatarImage} />
                    <View style={[styles.rankBadge, { backgroundColor: COLORS.teal }]}>
                       <Text style={styles.rankText}>3</Text>
                    </View>
                 </View>
                 
                 <Text style={styles.podiumName} numberOfLines={1}>{LEADERBOARD_DATA[2].name}</Text>
                 <Text style={styles.podiumScore}>{LEADERBOARD_DATA[2].km}<Text style={styles.unitText}>km</Text></Text>
              </View>

           </View>
        </View>

        {/* LISTA RESTANTE (Sheet branca arredondada) */}
        <View style={styles.listSheet}>
           
           {/* Seletor de Tempo (Weekly / Monthly) */}
           <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, timeFrame === 'Weekly' ? styles.toggleBtnActive : null]}
                onPress={() => setTimeFrame('Weekly')}
              >
                 <Text style={[styles.toggleText, timeFrame === 'Weekly' ? styles.toggleTextActive : styles.toggleTextInactive]}>Weekly</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.toggleBtn, timeFrame === 'Monthly' ? styles.toggleBtnActive : null]}
                onPress={() => setTimeFrame('Monthly')}
              >
                 <Text style={[styles.toggleText, timeFrame === 'Monthly' ? styles.toggleTextActive : styles.toggleTextInactive]}>Monthly</Text>
              </TouchableOpacity>
           </View>

           {/* Lista de Utilizadores */}
           <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {LEADERBOARD_DATA.slice(3).map((user, index) => (
                 <View 
                   key={index} 
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
                       {user.km} <Text style={{fontSize: 12, fontWeight: 'normal'}}>km</Text>
                    </Text>
                 </View>
              ))}
           </ScrollView>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 100, // Garantir que fica por cima de tudo
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
    paddingBottom: 30, // Espaço para a sheet branca subir um pouco se necessário
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start', // Alinhar pelo topo para controlar alturas com marginTop
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 15,
  },
  podiumColumn: {
    alignItems: 'center',
    width: width * 0.25, // Cada coluna ocupa ~25% da largura
  },
  customIconContainer: {
    marginBottom: 8,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Avatares do Pódio
  avatarRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    padding: 2, // Espaço entre borda e imagem
    backgroundColor: 'white',
    marginBottom: 8,
    position: 'relative',
  },
  avatarRingLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    padding: 3,
    backgroundColor: 'white',
    marginBottom: 8,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  avatarImageLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  
  // Badges de Rank (1, 2, 3)
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

  // Textos do Pódio
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 12,
    textAlign: 'center',
  },
  podiumNameLarge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 14,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primaryGreen, // Ou a cor do respetivo lugar
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
    // Sombra para destacar a sheet sobre o fundo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    elevation: 5,
  },
  
  // Toggle (Weekly/Monthly)
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // Cinza muito claro
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

  // Scroll Lista
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