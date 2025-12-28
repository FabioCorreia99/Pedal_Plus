import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Filter } from 'lucide-react-native';
import { supabase } from '../../lib/supabase'; // Certifica-te que o caminho está correto

const COLORS = { darkText: "#1A1A1A", textGray: "#9ca3af", primaryOrange: "#FF9E46" };

// Interface que corresponde às colunas da tua tabela 'groups' no Supabase
interface GroupItem {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export default function GroupsView() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      // 'groups' é o nome exato da tabela que criaste no SQL Editor
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('id', { ascending: true }); // Opcional: ordenar por ID

      if (error) {
        console.error('Erro ao buscar grupos:', error.message);
      } else {
        // O Supabase retorna null se não houver dados, por isso usamos || []
        setGroups(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        <Text style={styles.loadingText}>A carregar grupos...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderTitle}>Following Groups</Text>
        <Filter size={16} color="#9ca3af"/>
      </View>
      
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ainda não há grupos disponíveis.</Text>
        </View>
      ) : (
        groups.map(g => (
            <View key={g.id} style={styles.listItem}>
              {/* Fallback para imagem se a URL estiver vazia ou inválida */}
              <Image 
                source={{ uri: g.image_url || 'https://via.placeholder.com/100' }} 
                style={styles.listImage} 
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.listItemTitle}>{g.name}</Text>
                  <Text style={styles.listItemDesc}>{g.description}</Text>
              </View>
            </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16, 
    alignItems: 'center' 
  },
  subHeaderTitle: { 
    fontWeight: 'bold', 
    color: COLORS.darkText 
  },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    elevation: 1 
  },
  listImage: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#eee' 
  },
  listItemTitle: { 
    fontWeight: 'bold', 
    color: COLORS.darkText,
    fontSize: 16
  },
  listItemDesc: { 
    fontSize: 12, 
    color: '#6b7280',
    marginTop: 2
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.textGray,
    fontSize: 12
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center'
  },
  emptyText: {
    color: COLORS.textGray,
    fontStyle: 'italic'
  }
});