import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ActivityIndicator, 
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { X, Image as ImageIcon, Check } from 'lucide-react-native';
import { supabase } from '../../lib/supabase'; // Ajusta o caminho conforme necessário

const COLORS = { 
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A", 
  textGray: "#9ca3af", 
  lightGray: "#F5F7F8",
  white: "#FFFFFF",
  error: "#ef4444"
};

interface CreateGroupViewProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: () => void; // Callback para atualizar a lista "pai"
}

// Imagens default caso o user não coloque URL (Ciclismo/Natureza)
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=600&fit=crop', // Floresta
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&fit=crop', // Ciclistas
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&fit=crop', // Ginásio/Fit
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=600&fit=crop'  // Natureza
];

export default function CreateGroupView({ visible, onClose, onGroupCreated }: CreateGroupViewProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Please enter a group name.");
      return;
    }

    setLoading(true);

    try {
      // 1. Obter utilizador atual
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "You must be logged in to create a group.");
        setLoading(false);
        return;
      }

      // 2. Definir imagem (Input ou Aleatória)
      const finalImage = photoUrl.trim() 
        ? photoUrl 
        : DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];

      // 3. INSERIR O GRUPO
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim(),
          owner_id: user.id,
          photo_url: finalImage
        })
        .select() // Importante para receber o ID do grupo criado
        .single();

      if (groupError) throw groupError;

      if (groupData) {
        // 4. INSERIR O MEMBRO (ADMIN)
        // O dono do grupo é automaticamente adicionado como admin
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupData.id,
            user_id: user.id,
            role: 'admin'
          });

        if (memberError) {
          console.error("Erro ao adicionar membro admin:", memberError);
          // Nota: O grupo foi criado, mas a associação falhou. 
          // Numa app real, poderiamos tentar reverter ou mostrar um aviso.
        }
        
        // Sucesso total
        Alert.alert("Success!", "Group created successfully.");
        resetForm();
        onGroupCreated(); // Atualiza a lista na tela anterior
        onClose(); // Fecha o modal
      }

    } catch (error: any) {
      console.error('Error creating group:', error);
      Alert.alert("Error", error.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPhotoUrl('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Group</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
            
            {/* IMAGE PREVIEW / INPUT */}
            <View style={styles.imageSection}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <ImageIcon size={40} color={COLORS.textGray} />
                  <Text style={styles.placeholderText}>No image URL provided</Text>
                  <Text style={styles.placeholderSubText}>(A random cover will be used)</Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Group Photo URL (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={COLORS.textGray}
                value={photoUrl}
                onChangeText={setPhotoUrl}
                autoCapitalize="none"
              />
            </View>

            {/* FORM FIELDS */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Group Name <Text style={{color: COLORS.error}}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sunday Morning Riders"
                placeholderTextColor={COLORS.textGray}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this group about?"
                placeholderTextColor={COLORS.textGray}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* BUTTON */}
            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={20} color="white" style={{marginRight: 8}} />
                  <Text style={styles.submitBtnText}>Create Community</Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '90%', // Ocupa 90% da tela
    paddingHorizontal: 24,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  closeBtn: {
    padding: 4,
  },
  
  // Image Section
  imageSection: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: '#eee',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: COLORS.textGray,
    fontWeight: '600',
  },
  placeholderSubText: {
    fontSize: 10,
    color: COLORS.textGray,
  },

  // Form
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.darkText,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    height: 100,
  },

  // Button
  submitBtn: {
    backgroundColor: COLORS.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});