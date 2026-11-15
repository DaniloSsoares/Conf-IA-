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
import { PhotoModal } from "./components/PhotoModal";

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
    photoModalVisible,
    setPhotoModalVisible,
    handleRemovePhoto,
    handlePickImage,
    handleUpdateLocation,
    handleSave,
    handleDeleteConfirm,
  } = useEditReport();

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Report</Text>
        <TouchableOpacity onPress={handleDeleteConfirm} style={styles.backButton}>
          {deleting ? (
            <ActivityIndicator size="small" color={theme.alertRed || "#D74247"} />
          ) : (
            <Ionicons name="trash-outline" size={22} color={theme.alertRed || "#D74247"} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.headerSubtitle}>
        Update the incident details to keep the system accurate.
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incident Type</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name={(selectedCategoryMeta?.icon || "water-outline") as any} size={20} color={theme.primary || "#0047FF"} />
              <Text style={styles.selectInputText}>{selectedCategoryMeta?.label || "Select the type"}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={isDarkMode ? "rgba(255,255,255,0.6)" : "#858D99"} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Describe what is happening..."
            placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.4)" : "#858D99"}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Card 3: Localização */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <View style={styles.locationBox}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location-sharp" size={20} color={theme.primary || "#0047FF"} />
            </View>
            <Text style={styles.locationText} numberOfLines={2}>
              {address || "Location saved with the report"}
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

        {/* Card 4: Photo Evidence */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Photo Evidence</Text>
            {currentPhotoUri ? (
              <TouchableOpacity style={styles.removePhotoButton} onPress={handleRemovePhoto}>
                <Ionicons name="trash-outline" size={16} color={theme.alertRed || "#D74247"} />
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {currentPhotoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: currentPhotoUri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.changePhotoOverlayBtn}
                onPress={() => setPhotoModalVisible(true)}
              >
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoBox}
              onPress={() => setPhotoModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={32} color={theme.primary || "#0047FF"} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
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
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving || deleting}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
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

      <PhotoModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onPickImage={handlePickImage}
        styles={styles}
        iconColor={iconColor}
        theme={theme}
      />
    </LinearGradient>
  );
}