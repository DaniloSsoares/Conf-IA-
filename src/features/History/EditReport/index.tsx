import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "@/src/shared/constants/theme";
import { getStyles } from "./style";
import { useEditReport } from "./useEditReport";
import { CategoryModal } from "./components/CategoryModal";
import { ConfirmModal } from "@/src/components/ui/ConfirmModal";

export default function EditReportScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const iconColor = isDarkMode ? "#FFFFFF" : "#2C2B30";

  const {
    router,
    category,
    setCategory,
    description,
    setDescription,
    address,
    updatingLocation,
    currentPhotoUri,
    saving,
    deleting,
    selectedCategoryMeta,
    categoryModalVisible,
    setCategoryModalVisible,
    handleRemovePhoto,
    handleTakePhoto,
    handleUpdateLocation,
    handleSave,
    handleDeleteConfirm,
    confirmarExclusaoVisivel,
    setConfirmarExclusaoVisivel,
    excluirReporte,
  } = useEditReport();

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Reporte</Text>
        <TouchableOpacity onPress={handleDeleteConfirm} style={styles.backButton}>
          {deleting ? (
            <ActivityIndicator size="small" color={theme.alertRed || "#D74247"} />
          ) : (
            <Ionicons name="trash-outline" size={22} color={theme.alertRed || "#D74247"} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.headerSubtitle}>
        Atualize as informações sobre a ocorrência para manter o sistema preciso.
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tipo de Ocorrência</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name={(selectedCategoryMeta?.icon || "water-outline") as any} size={20} color={theme.primary || "#0047FF"} />
              <Text style={styles.selectInputText}>{selectedCategoryMeta?.label || "Selecione o tipo"}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={isDarkMode ? "rgba(255,255,255,0.6)" : "#858D99"} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descrição Adicional</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Descreva detalhes sobre o que está acontecendo..."
            placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.4)" : "#858D99"}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Card 3: Localização */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Localização</Text>
          <View style={styles.locationBox}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location-sharp" size={20} color={theme.primary || "#0047FF"} />
            </View>
            <Text style={styles.locationText} numberOfLines={2}>
              {address || "Localização salva no registro"}
            </Text>
            <TouchableOpacity
              style={styles.locationEditBtn}
              onPress={handleUpdateLocation}
              disabled={updatingLocation}
            >
              {updatingLocation ? (
                <ActivityIndicator size="small" color={theme.primary || "#0047FF"} />
              ) : (
                <Ionicons name="pencil-outline" size={20} color={theme.primary || "#0047FF"} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 4: Evidência Fotográfica */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Evidência Fotográfica</Text>
            {currentPhotoUri ? (
              <TouchableOpacity style={styles.removePhotoButton} onPress={handleRemovePhoto}>
                <Ionicons name="trash-outline" size={16} color={theme.alertRed || "#D74247"} />
                <Text style={styles.removePhotoText}>Remover</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {currentPhotoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: currentPhotoUri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.changePhotoOverlayBtn}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                <Text style={styles.changePhotoText}>Alterar Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoBox}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={32} color={theme.primary || "#0047FF"} />
              <Text style={styles.addPhotoText}>Adicionar Foto</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Footer / Botões Fixos */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving || deleting}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving || deleting}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modais Refatorados */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        category={category}
        onSelectCategory={setCategory}
        styles={styles}
        iconColor={iconColor}
        theme={theme}
      />

      <ConfirmModal
        visible={confirmarExclusaoVisivel}
        variant="danger"
        icon="trash-outline"
        title="Excluir reporte"
        message="Tem certeza que deseja excluir este reporte permanentemente? Se ele já virou alerta da comunidade, o alerta também é encerrado."
        confirmText="Excluir"
        onConfirm={excluirReporte}
        onCancel={() => setConfirmarExclusaoVisivel(false)}
      />
    </LinearGradient>
  );
}