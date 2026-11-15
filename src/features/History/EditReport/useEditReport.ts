import { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

import { REPORT_CATEGORIES } from "@/src/shared/constants/reportCategories";
import { ReportCategory } from "@/src/shared/types/report";
import { updateReport, deleteReport } from "@/src/shared/service/reportService";
import { supabaseConfig } from "@/src/config/supabase";

export interface SelectedPhoto {
  uri: string;
  base64?: string;
  ext?: string;
}

export function useEditReport() {
  const router = useRouter();
  const { id, data } = useLocalSearchParams<{ id: string; data: string }>();

  const initialReport = data ? JSON.parse(data) : null;
  const reportId = id || initialReport?.id;

  // Form Fields State
  const [category, setCategory] = useState<ReportCategory>(
    initialReport?.reporte_tipo_ocorrencia || "alagamento"
  );
  const [description, setDescription] = useState<string>(
    initialReport?.reporte_descricao || ""
  );
  const [address, setAddress] = useState<string>(
    initialReport?.reporte_endereco || ""
  );
  const [latitude, setLatitude] = useState<number>(
    initialReport?.reporte_latitude || 0
  );
  const [longitude, setLongitude] = useState<number>(
    initialReport?.reporte_longitude || 0
  );

  // Photo State
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initialReport?.reporte_midias?.[0]?.midia_url || null
  );
  const [newPhoto, setNewPhoto] = useState<SelectedPhoto | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [updatingLocation, setUpdatingLocation] = useState<boolean>(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [photoModalVisible, setPhotoModalVisible] = useState<boolean>(false);

  const selectedCategoryMeta = REPORT_CATEGORIES.find((c) => c.id === category);
  const currentPhotoUri = newPhoto ? newPhoto.uri : photoUrl;

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setNewPhoto(null);
    setPhotoRemoved(true);
  };

  const handlePickImage = async (useCamera: boolean) => {
    try {
      setPhotoModalVisible(false);

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission denied",
            text2: "We need camera access to take the photo.",
          });
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          base64: true,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const fileExt = asset.uri.split(".").pop() || "jpg";
          setNewPhoto({
            uri: asset.uri,
            base64: asset.base64 || undefined,
            ext: fileExt,
          });
          setPhotoRemoved(false);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission denied",
            text2: "We need gallery access to select the photo.",
          });
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          base64: true,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const fileExt = asset.uri.split(".").pop() || "jpg";
          setNewPhoto({
            uri: asset.uri,
            base64: asset.base64 || undefined,
            ext: fileExt,
          });
          setPhotoRemoved(false);
        }
      }
    } catch (error) {
      console.error("Erro ao selecionar foto:", error);
      Toast.show({
        type: "error",
        text1: "Image error",
        text2: "Could not select the image.",
      });
    }
  };

  const handleUpdateLocation = async () => {
    try {
      setUpdatingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Location access is required.",
        });
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lng } = currentPosition.coords;
      setLatitude(lat);
      setLongitude(lng);

      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode) {
          const formatted = `${geocode.street || geocode.name || "Rua s/n"}, ${geocode.subregion || geocode.city || ""}`;
          setAddress(formatted);
        }
      } catch (e) {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }

      Toast.show({
        type: "success",
        text1: "Location Updated",
        text2: "Your current location was assigned to the report.",
      });
    } catch (error) {
      console.error("Erro ao atualizar localização:", error);
      Toast.show({
        type: "error",
        text1: "Location Error",
        text2: "Could not get your current location.",
      });
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!reportId) {
      Toast.show({
        type: "error",
        text1: "Report error",
        text2: "Report identifier not found.",
      });
      return;
    }

    try {
      setSaving(true);

      const { data: userData } = await supabaseConfig.auth.getUser();
      const userId = userData.user?.id || initialReport?.perfil_id;

      if (!userId) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "User not authenticated.",
        });
        return;
      }

      const { error: updateErr } = await updateReport(reportId, userId, {
        reporte_tipo_ocorrencia: category,
        reporte_descricao: description,
        reporte_latitude: latitude,
        reporte_longitude: longitude,
        reporte_endereco: address,
        removeFoto: photoRemoved,
        fotoBase64: newPhoto?.base64,
        fotoExt: newPhoto?.ext || "jpg",
      });

      if (updateErr) {
        console.error("Erro ao atualizar reporte:", updateErr);
        Toast.show({
          type: "error",
          text1: "Save failed",
          text2: "An error occurred while updating the report.",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Report Updated!",
        text2: "Your changes were saved successfully.",
      });

      router.back();
    } catch (error) {
      console.error("Erro no submit do reporte:", error);
      Toast.show({
        type: "error",
        text1: "Unexpected Error",
        text2: "Could not save the changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to permanently delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!reportId) return;
            try {
              setDeleting(true);
              const { success, error: delErr } = await deleteReport(reportId);

              if (!success || delErr) {
                Toast.show({
                  type: "error",
                  text1: "Error deleting",
                  text2: "Could not delete the report.",
                });
                return;
              }

              Toast.show({
                type: "success",
                text1: "Report Deleted",
                text2: "The report was removed successfully.",
              });

              router.back();
            } catch (error) {
              console.error("Erro ao excluir:", error);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return {
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
  };
}
