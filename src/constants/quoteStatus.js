/** Estados de cotización (alinear con el backend). */
export const QUOTE_STATUS_LABEL = {
  pending: 'Pendiente',
  contacted: 'En contacto',
  offered: 'Propuesta enviada',
  accepted: 'Aceptada por el cliente',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

/** Orden en select de admin */
export const QUOTE_ADMIN_STATUS_ORDER = [
  ['pending', 'Pendiente'],
  ['contacted', 'En contacto'],
  ['offered', 'Propuesta enviada (esperando cliente)'],
  ['accepted', 'Aceptada por el cliente'],
  ['rejected', 'Rechazada'],
  ['cancelled', 'Cancelada'],
];
