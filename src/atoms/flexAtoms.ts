// Main atoms for flexboard

import {atom} from 'jotai';
import {View} from '../types/common';

// current view index
export const viewIdxAtom = atom<number>(0);

// list of views
export const viewsAtom = atom<View[]>([]);
