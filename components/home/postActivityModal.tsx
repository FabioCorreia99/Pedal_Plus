import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { Facebook, Instagram, Share2, Twitter, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

// TODO: add photo upload functionality 

interface PostActivityModalProps {
  visible: boolean;
  onClose: () => void;
  durationMinutes: number;
  completedAt: Date;
  routeId?: string | null;
  distanceKm?: number;
}

export default function PostActivityModal({
  visible,
  onClose,
  durationMinutes,
  completedAt,
  distanceKm,
  routeId,
}: PostActivityModalProps) {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'everyone' | 'friends' | 'private'>('everyone');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);
  const [tempPhotoUri, setTempPhotoUri] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${displayHours}:${minutes}${period}`;
  };

  const getVisibilityLabel = () => {
    switch (visibility) {
      case 'everyone':
        return 'Everyone';
      case 'friends':
        return 'Friends only';
      case 'private':
        return 'Private';
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Camera permission needed',
          'Please allow camera access to take a photo for your activity.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri ?? null;
      if (!uri) return;

      // Show preview modal with overlay + share placeholders
      setTempPhotoUri(uri);
      setPhotoPreviewVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not open the camera.');
    }
  };

  

  const handlePost = async () => {
    // TODO: Implement post logic
    await supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        await supabase.from('activities').insert({
          user_id: user.id,
          route_id: routeId,
          title,
          description,
          photo_url: photoUri,
          distance_km: distanceKm || 0, 
          duration_minutes: durationMinutes,
          completed_at: completedAt.toISOString(),
          visibility,
          points_earned: ((distanceKm || 0) * 0.1),
          eco_impact_score: ((distanceKm || 0) * 0.05),
          calories_burned: ((distanceKm || 0) * 8),

        }).then(({ data, error }) => {
          if (error) {
            console.error('Error posting activity:', error);
          } else {
            console.log('Activity posted successfully:', data);
          }
        });
      }
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Publicar Atividade</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.label}>Duração</Text>
            <Text style={styles.valueText}>{durationMinutes} minutos</Text>
          </View>

          {/* When */}
          <View style={styles.section}>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.valueText}>{formatDate(completedAt)}</Text>
          </View>

          {/* Add Photo/Video */}
          <TouchableOpacity style={styles.mediaButton } onPress={handlePhotoUpload}>
            <View style={styles.mediaIconContainer}>
              <View style={styles.imageIcon}>
                <View style={styles.imageIconInner} />
                <View style={styles.imageIconCircle} />
              </View>
            </View>
            <Text style={styles.mediaButtonText}>Adicionar uma foto/vídeo</Text>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Título"
              multiline
              maxLength={100}
              value={title}
              onChangeText={setTitle}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Descrição"
              multiline
              maxLength={2000}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/2000</Text>
          </View>

          {/* Visibility */}
          <TouchableOpacity
            style={styles.visibilityRow}
            onPress={() => {
              // Cycle through visibility options
              setVisibility((prev) =>
                prev === 'everyone' ? 'friends' : prev === 'friends' ? 'private' : 'everyone'
              );
            }}
          >
            <Text style={styles.visibilityLabel}>Visibilidade</Text>
            <Text style={styles.visibilityValue}>{getVisibilityLabel()} ›</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Post Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Photo preview modal */}
      <Modal visible={photoPreviewVisible} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16 }}>
            <TouchableOpacity
              onPress={() => {
                setPhotoPreviewVisible(false);
                setTempPhotoUri(null);
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>Voltar</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {tempPhotoUri ? (
              <View style={{ width: '100%', height: '100%' }}>
                <Image
                  source={{ uri: tempPhotoUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />

                {/* Overlay */}
                <View
                  style={{
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 120,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                    {(distanceKm ?? 0).toFixed(2)} km
                  </Text>
                  <Text style={{ color: '#fff', marginTop: 4 }}>
                    {durationMinutes} min
                  </Text>
                  <Text style={{ color: '#fff', marginTop: 4 }}>
                    {formatDate(completedAt)}
                  </Text>
                </View>

                {/* Share icons (placeholders) */}
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 40,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    paddingHorizontal: 24,
                  }}
                >
                  <TouchableOpacity onPress={() => { /* TODO */ }}>
                    <Instagram color="#fff" size={28} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { /* TODO */ }}>
                    <Facebook color="#fff" size={28} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { /* TODO */ }}>
                    <Twitter color="#fff" size={28} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      // Optional generic share now (kept simple); remove if you truly want only placeholders.
                      if (tempPhotoUri && (await Sharing.isAvailableAsync())) {
                        await Sharing.shareAsync(tempPhotoUri);
                      }
                    }}
                  >
                    <Share2 color="#fff" size={28} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>

          {/* Done => store uri in photoUri and go back to PostActivityModal */}
          <View style={{ padding: 16, paddingBottom: 40, backgroundColor: '#000' }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#FF9331',
                paddingVertical: 14,
                borderRadius: 999,
                alignItems: 'center',
              }}
              onPress={() => {
                setPhotoUri(tempPhotoUri);
                setPhotoPreviewVisible(false);
                setTempPhotoUri(null);
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#86C584',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 60,
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 16,
    color: '#FF9331',
    fontWeight: '500',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mediaIconContainer: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  imageIcon: {
    width: 40,
    height: 32,
    position: 'relative',
  },
  imageIconInner: {
    width: 40,
    height: 32,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 4,
  },
  imageIconCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#333',
  },
  mediaButtonText: {
    fontSize: 16,
    color: '#333',
  },
  descriptionContainer: {
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 80,
  },
  titleInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 40,
  },
  titleContainer: {
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    minHeight: 60,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  visibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  visibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  visibilityValue: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  postButton: {
    backgroundColor: '#FF9331',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
