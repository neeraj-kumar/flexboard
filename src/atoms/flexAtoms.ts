// Main atoms for flexboard

import {atom} from 'jotai';
import {View} from '../types/common';

// current view index
export const viewIdxAtom = atom<number>(0);

// list of view IDs
export const viewsAtom = atom<View[]>([]);

// atom for next available view ID
export const nextViewIdAtom = atom<number>(1);
