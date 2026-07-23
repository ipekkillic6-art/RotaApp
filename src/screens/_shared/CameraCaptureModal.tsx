import { useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, X } from 'lucide-react-native';
import { Button, Icon, Touchable, Typography, useTheme } from '../../design-system';

/** Kamera (koyu) üstündeki katmanlar için — app token'ı değil, kamera UI'si. */
const CAMERA_SCRIM = 'rgba(0,0,0,0.55)';

export type CaptureMode = 'photo' | 'qr';

export interface CameraCaptureModalProps {
  visible: boolean;
  mode: CaptureMode;
  onClose: () => void;
  /** Fotoğraf çekildiğinde dosya URI'si. */
  onCapture?: (uri: string) => void;
  /** QR okunduğunda içeriği. */
  onScan?: (data: string) => void;
}

/**
 * Tam ekran kamera — foto çekme veya QR okuma. expo-camera (CameraView).
 * İzin yoksa açıklama gösterir. Foto, yüklemeden önce quality ile sıkıştırılır.
 */
export function CameraCaptureModal({
  visible,
  mode,
  onClose,
  onCapture,
  onScan,
}: CameraCaptureModalProps) {
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
    if (photo?.uri) onCapture?.(photo.uri);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: theme.colors.background.primary }]}>
        {!permission?.granted ? (
          <View style={[styles.center, { padding: theme.spacing.xl, gap: theme.spacing.md }]}>
            <Icon icon={Camera} size="xl" tone="muted" />
            <Typography variant="bodyStrong" align="center">
              Kamera izni gerekiyor
            </Typography>
            <Typography variant="bodySm" tone="secondary" align="center">
              {mode === 'qr'
                ? 'Teslimat QR kodunu okutmak için kamera iznine ihtiyacımız var.'
                : 'Teslimat fotoğrafı çekmek için kamera iznine ihtiyacımız var.'}
            </Typography>
            <Button label="İzin ver" onPress={requestPermission} />
            <Button label="Kapat" variant="tertiary" onPress={onClose} />
          </View>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={mode === 'qr' ? { barcodeTypes: ['qr'] } : undefined}
              onBarcodeScanned={
                mode === 'qr'
                  ? ({ data }) => {
                      onScan?.(data);
                      onClose();
                    }
                  : undefined
              }
            />

            {/* Kapat */}
            <Touchable
              onPress={onClose}
              feedback="opacity"
              accessibilityLabel="Kapat"
              style={[styles.close, { top: theme.spacing['3xl'], right: theme.spacing.lg }]}
            >
              <View style={[styles.closeBtn, { backgroundColor: CAMERA_SCRIM }]}>
                <Icon icon={X} tone="inverse" />
              </View>
            </Touchable>

            {mode === 'qr' ? (
              <View style={[styles.hint, { bottom: theme.spacing['4xl'] }]}>
                <View style={[styles.hintPill, { backgroundColor: CAMERA_SCRIM }]}>
                  <Typography variant="caption" color={theme.colors.text.inverse}>
                    QR kodu çerçeveye getir
                  </Typography>
                </View>
              </View>
            ) : (
              <View style={[styles.shutterRow, { bottom: theme.spacing['4xl'] }]}>
                <Touchable onPress={takePhoto} feedback="opacity" accessibilityLabel="Fotoğraf çek">
                  <View style={[styles.shutter, { borderColor: theme.colors.background.elevated }]} />
                </Touchable>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  close: { position: 'absolute' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hint: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  hintPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  shutterRow: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 6, backgroundColor: 'transparent' },
});
