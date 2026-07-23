import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

/**
 * Navigator dışından (push bildirimi handler'ı) yönlendirme için ref.
 * NavigationContainer'a `ref={navigationRef}` verilir.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
