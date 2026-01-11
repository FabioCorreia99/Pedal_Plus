import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PostActivityModalProps {
  visible: boolean;
  onClose: () => void;
  durationMinutes: number;
  completedAt: Date;
}

export default function PostActivityModal({
  visible,
  onClose,
  durationMinutes,
  completedAt,
}: PostActivityModalProps) {
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'everyone' | 'friends' | 'private'>('everyone');

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

  const handlePost = () => {
    // TODO: Implement post logic
    console.log('Posting activity:', {
      durationMinutes,
      completedAt,
      description,
      visibility,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Post Activity</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.valueText}>{durationMinutes} minutes</Text>
          </View>

          {/* When */}
          <View style={styles.section}>
            <Text style={styles.label}>When</Text>
            <Text style={styles.valueText}>{formatDate(completedAt)}</Text>
          </View>

          {/* Add Photo/Video */}
          <TouchableOpacity style={styles.mediaButton}>
            <View style={styles.mediaIconContainer}>
              <View style={styles.imageIcon}>
                <View style={styles.imageIconInner} />
                <View style={styles.imageIconCircle} />
              </View>
            </View>
            <Text style={styles.mediaButtonText}>Add a photo/video</Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description"
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
            <Text style={styles.visibilityLabel}>Visibility</Text>
            <Text style={styles.visibilityValue}>{getVisibilityLabel()} ›</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Post Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
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
