export {
  createSupabaseBrowserClient,
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from './client';
export {
  hashPin,
  verifyPin,
  signEmployeeJWT,
  verifyEmployeeJWT,
  type EmployeeClaims,
} from './auth';
export {
  findEmployeeByPin,
  findEmployeeByPinV2,
  getOpenShiftForEmployee,
  getOpenShiftForEmployeeV2,
  openShift,
  closeShift,
  getBranchWithRestaurant,
  getLastPosActivation,
  type EmployeeRow,
  type ShiftRow,
  type OpenShiftInput,
  type BranchWithRestaurant,
  type LastPosActivation,
} from './queries';
export {
  createPairingCode,
  consumePairingCode,
  registerDevice,
  findActiveDeviceByTokenHash,
  touchDeviceLastSeen,
  listDevicesForTenant,
  revokeDevice,
  type PosDeviceRow,
  type PosPairingCodeRow,
  type CreatePairingCodeInput,
  type ConsumedPairingCode,
  type RegisterDeviceInput,
} from './queries-devices';
export type { Database } from './types';
