import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onPickImage: (useCamera: boolean) => void;
  styles: any;
  iconColor: string;
  theme: any;
}

export function PhotoModal({
  visible,
  onClose,
  onPickImage,
  styles,
  iconColor,
  theme,
}: PhotoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Evidência</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.photoOptionBtn} onPress={() => onPickImage(true)}>
            <Ionicons name="camera-outline" size={24} color={theme.primary || "#0047FF"} />
            <Text style={styles.photoOptionText}>Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoOptionBtn} onPress={() => onPickImage(false)}>
            <Ionicons name="images-outline" size={24} color={theme.primary || "#0047FF"} />
            <Text style={styles.photoOptionText}>Escolher da Galeria</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
