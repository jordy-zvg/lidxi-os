import type { Role } from '@lidxi/shared';
import { cents } from '@lidxi/shared';
import type { CentsMXN } from '@lidxi/shared';

export interface MockEmployee {
  id: string;
  name: string;
  role: Role;
  onShift: boolean;
  shiftStart: string | null;
  orders: number;
  sales: CentsMXN;
}

export const MOCK_EMPLOYEES: MockEmployee[] = [
  {
    id: 'e001',
    name: 'Jorge Vargas',
    role: 'manager',
    onShift: true,
    shiftStart: '11:08',
    orders: 23,
    sales: cents(428700),
  },
  {
    id: 'e002',
    name: 'Diana Rivera',
    role: 'cashier',
    onShift: true,
    shiftStart: '13:00',
    orders: 18,
    sales: cents(312400),
  },
  {
    id: 'e003',
    name: 'Marco Pérez',
    role: 'cook',
    onShift: true,
    shiftStart: '11:08',
    orders: 0,
    sales: cents(0),
  },
  {
    id: 'e004',
    name: 'Ramón Gómez',
    role: 'cook',
    onShift: false,
    shiftStart: null,
    orders: 0,
    sales: cents(0),
  },
];
