// Main atoms for flexboard

import {atom} from 'jotai';
import {View, Binding, Bindmap} from '../types/common';

export const SERVER = 'http://localhost:8908';

// Data atoms
export const idsAtom = atom<string[]>([]);
export const ptMdAtom = atom<Record<string, any>>({});
export const tagsAtom = atom<Record<string, string[]>>({});

// Fetch actions
export const fetchIndexAtom = atom(
  null,
  async (get, set) => {
    const data = await fetch(SERVER + "/index/").then(r => r.json());
    set(idsAtom, data.ids);
    return data.values;
  }
);

export const fetchTagsAtom = atom(
  null,
  async (get, set) => {
    const data = await fetch(SERVER + "/tags/").then(r => r.json());
    set(tagsAtom, data.tags);
  }
);

export const fetchPtMdAtom = atom(
  null,
  async (get, set, ids: string[]) => {
    const currentMd = get(ptMdAtom);
    const toGet = ids.filter(id => !currentMd[id]);
    if (toGet.length === 0) {
      return false;
    }
    const data = await fetch(SERVER + "/pt_md/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: toGet }),
    }).then(r => r.json());
    set(ptMdAtom, {...currentMd, ...data.data});
    return true;
  }
);

// View management atoms
export const viewIdxAtom = atom<number>(0);
export const viewsAtom = atom<View[]>([]);

// Evaluate a particular binding for a given view
export const evaluateBindingAtom = atom(
  null,
  (get, set, viewId: string, bindingName: string, values: Record<string, number>) => {
    const views = get(viewsAtom);
    const view = views.find(v => v.id === viewId);
    if (!view) return;
    const binding = view.bindmap[bindingName];
    if (!binding) return;
    console.log('Evaluating binding', view, bindingName, binding);
    // get input data
    const ids = get(idsAtom);
    const ptMd = get(ptMdAtom);
    const tags = get(tagsAtom);
    // create a function from the binding definition
    let func;
    try {
      func = new Function('id', 'value', 'md', 'tags', binding.def);
    } catch (e) {
      console.error('Error creating function for binding', bindingName, e);
      return;
    }
    // evaluate the function for each id
    const evals = ids.map(id => {
      const value = values ? values[id] : undefined;
      const md = ptMd[id] || {};
      const tagList = tags[id] || [];
      try {
        return func(id, value, md, tagList);
      } catch (e) {
        console.error('Error evaluating binding', bindingName, e);
        return null;
      }
    });
    console.log('Evaluated values for binding', bindingName, evals.slice(0, 10));
    (view.bindmap[bindingName] as any).evals = evals;
    // update the views atom to trigger re-render
    set(viewsAtom, [...views]);
  }
);

// Watcher atom that triggers evaluations when dependencies change
export const bindingWatcherAtom = atom(
  (get) => {
    const views = get(viewsAtom);
    const ids = get(idsAtom);
    const ptMd = get(ptMdAtom);
    const tags = get(tagsAtom);
    return { views, ids, ptMd, tags };
  },
  (get, set) => {
    const { views } = get(bindingWatcherAtom);
    const values = get(fetchIndexAtom);
    
    // Evaluate all bindings in all views
    views.forEach(view => {
      Object.keys(view.bindmap).forEach(bindingName => {
        set(evaluateBindingAtom, view.id, bindingName, values);
      });
    });
  }
);

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
    // evaluate the new binding using current values
    const values = get(fetchIndexAtom);
    set(evaluateBindingAtom, viewId, name, values);
    set(viewsAtom, [...views]);
  }
);

// create a new view
export const addViewAtom = atom(
  null,
  (get, set) => {
    const views = get(viewsAtom);
    const newView: View = {id: Date.now().toString(), bindmap: {}, inputs: 'ids'};
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
