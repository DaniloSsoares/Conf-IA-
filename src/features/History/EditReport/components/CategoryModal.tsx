import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { REPORT_CATEGORIES } from "@/src/shared/constants/reportCategories";
import { ReportCategory } from "@/src/shared/types/report";

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  category: ReportCategory;
  onSelectCategory: (cat: ReportCategory) => void;
  styles: any;
  iconColor: string;
  theme: any;
}

export function CategoryModal({
  visible,
  onClose,
  category,
  onSelectCategory,
  styles,
  iconColor,
  theme,
}: CategoryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tipo de Ocorrência</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {REPORT_CATEGORIES.map((item) => {
              const isSelected = item.id === category;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryOption,
                    isSelected && styles.categoryOptionSelected,
                  ]}
                  onPress={() => {
                    onSelectCategory(item.id);
                    onClose();
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={isSelected ? (theme.primary || "#0047FF") : iconColor}
                  />
                  <Text
                    style={[
                      styles.categoryOptionText,
                      isSelected && { color: theme.primary || "#0047FF", fontWeight: "700" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
