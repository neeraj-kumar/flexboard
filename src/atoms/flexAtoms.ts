// Main atoms for flexboard

import {atom} from 'jotai';
import {View, Binding, Bindmap} from '../types/common';

// current view index
export const viewIdxAtom = atom<number>(0);

// list of views
export const viewsAtom = atom<View[]>([]);

// create a new binding with given name and optional def within a view
export const addBindingAtom = atom(
  null,
  (get, set, viewId: string, name: string, def: string = '') => {
    console.log('Adding binding', viewId, name, def);
    const views = get(viewsAtom);
    const view = views.find(v => v.id === viewId);
    if (!view) return;
    const newBinding: Binding = {name, def};
    console.log('Adding new binding', view, newBinding);
    view.bindmap[name] = newBinding;
    set(viewsAtom, [...views]);
  }
);

// create a new view
export const addViewAtom = atom(
  null,
  (get, set) => {
    const views = get(viewsAtom);
    const newView: View = {id: Date.now().toString(), bindmap: {}};
    console.log('Adding new view', views, newView);
    set(viewsAtom, [...views, newView]);
    // increment viewIdx by one
    set(viewIdxAtom, views.length);
    // add '$filter' and '$sort' bindings to the new view
    set(addBindingAtom, newView.id, '$filter', 'return true');
    set(addBindingAtom, newView.id, '$sort', 'return 0');
  }
);

// delete a view by id
export const deleteViewAtom = atom(
  null,
  (get, set, id: number) => {
    let views = get(viewsAtom);
    views = views.filter(v => v.id !== id);
    set(viewsAtom, views);
    // if the deleted view was the current view, move viewIdx back one
    const viewIdx = get(viewIdxAtom);
    if (viewIdx >= views.length) {
      set(viewIdxAtom, Math.max(0, views.length - 1));
    }
  }
);
