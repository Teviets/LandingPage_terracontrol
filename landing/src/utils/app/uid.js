import { nanoid } from 'nanoid/non-secure'; // importante: non-secure para RN

export const generateID = () => `${nanoid(26).replace(/-/g, '')}`;
