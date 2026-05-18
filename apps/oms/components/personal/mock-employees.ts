import type { Role } from '@kobi/shared';

export interface MockEmployee {
  id: string;
  name: string;
  role: Role;
  onShift: boolean;
  shiftStart: string | null;
  orders: number;
  hoursToday: string;
}

export const MOCK_EMPLOYEES: MockEmployee[] = [
  {
    id: 'e001',
    name: 'Jorge Vargas',
    role: 'manager',
    onShift: true,
    shiftStart: '11:08',
    orders: 23,
    hoursToday: '4h 32m',
  },
  {
    id: 'e002',
    name: 'Diana Rivera',
    role: 'cashier',
    onShift: true,
    shiftStart: '13:00',
    orders: 18,
    hoursToday: '2h 40m',
  },
  {
    id: 'e003',
    name: 'Marco Pérez',
    role: 'cook',
    onShift: true,
    shiftStart: '11:08',
    orders: 0,
    hoursToday: '4h 32m',
  },
  {
    id: 'e004',
    name: 'Ramón Gómez',
    role: 'cook',
    onShift: false,
    shiftStart: null,
    orders: 0,
    hoursToday: '0h 00m',
  },
];
