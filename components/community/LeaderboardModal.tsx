import { X } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = { primaryGreen: "#5DBD76", primaryOrange: "#FF9E46", teal: "#35C2C1" };

const LEADERBOARD_DATA = [
  { rank: 1, name: "Bryan Wolf", km: 43, img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { rank: 2, name: "Meghan Jes...", km: 40, img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { rank: 3, name: "Alex Turner", km: 38, img: "https://randomuser.me/api/portraits/men/22.jpg" },
  { rank: 4, name: "Marsha Fisher", km: 36, img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { rank: 5, name: "Juanita Cormier", km: 35, img: "https://randomuser.me/api/portraits/women/12.jpg" },
  { rank: 6, name: "You", km: 34, img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop", isMe: true },
  { rank: 7, name: "Tamara Schmidt", km: 33, img: "https://randomuser.me/api/portraits/women/2.jpg" },
];

export default function LeaderboardModal({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity onPress={onClose}><X color="white" size={24} /></TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
         {/* Pódio */}
         <View style={styles.podiumContainer}>
            {/* 2º Lugar */}
            <View style={styles.podiumPlace}>
               <View style={[styles.avatarContainer, { borderColor: COLORS.primaryOrange }]}>
                  <Image source={{ uri: LEADERBOARD_DATA[1].img }} style={styles.avatarImg} />
               </View>
               <View style={[styles.badge, { backgroundColor: COLORS.primaryOrange }]}><Text style={styles.badgeText}>2</Text></View>
               <Text style={styles.podiumName}>{LEADERBOARD_DATA[1].name}</Text>
            </View>
            
            {/* 1º Lugar */}
            <View style={[styles.podiumPlace, { paddingBottom: 20 }]}>
               <View style={[styles.avatarContainer, { width: 80, height: 80, borderRadius: 40, borderColor: COLORS.primaryGreen }]}>
                  <Image source={{ uri: LEADERBOARD_DATA[0].img }} style={styles.avatarImg} />
               </View>
               <View style={[styles.badge, { top: -12, backgroundColor: COLORS.primaryGreen, width: 28, height: 28, borderRadius: 14 }]}>
                   <Text style={styles.badgeText}>1</Text>
               </View>
               <Text style={styles.podiumName}>{LEADERBOARD_DATA[0].name}</Text>
            </View>

            {/* 3º Lugar */}
            <View style={styles.podiumPlace}>
               <View style={[styles.avatarContainer, { borderColor: COLORS.teal }]}>
                  <Image source={{ uri: LEADERBOARD_DATA[2].img }} style={styles.avatarImg} />
               </View>
               <View style={[styles.badge, { backgroundColor: COLORS.teal }]}><Text style={styles.badgeText}>3</Text></View>
               <Text style={styles.podiumName}>{LEADERBOARD_DATA[2].name}</Text>
            </View>
         </View>

         {/* Lista */}
         <View style={styles.listContainer}>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
               {LEADERBOARD_DATA.slice(3).map((user, idx) => (
                  <View key={idx} style={[styles.listItem, user.isMe ? { backgroundColor: COLORS.primaryGreen } : { backgroundColor: 'white' }]}>
                     <Text style={[styles.rankText, user.isMe ? { color: 'white' } : { color: '#333' }]}>{user.rank}</Text>
                     <Image source={{ uri: user.img }} style={styles.listAvatar} />
                     <Text style={[styles.listName, user.isMe ? { color: 'white' } : { color: '#333' }]}>{user.name}</Text>
                     <Text style={[styles.listKm, user.isMe ? { color: 'white' } : { color: '#6b7280' }]}>{user.km} km</Text>
                  </View>
               ))}
            </ScrollView>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: 'white', zIndex: 50 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.primaryGreen },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, backgroundColor: '#F0FDF4' },
  podiumContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingVertical: 32, gap: 16 },
  podiumPlace: { alignItems: 'center' },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, overflow: 'hidden', marginBottom: 8 },
  avatarImg: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: -10, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  podiumName: { fontWeight: 'bold', fontSize: 12 },
  listContainer: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  rankText: { width: 24, fontWeight: 'bold' },
  listAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 12 },
  listName: { flex: 1, fontWeight: 'bold' },
  listKm: { fontWeight: 'bold' }
});