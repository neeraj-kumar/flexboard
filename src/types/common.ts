// Common types for flexboard

// A binding is a user-defined variable
export type Binding = {
  name: string;
  def: string; // Definition or expression for the binding
};

// A bindmap contains a list of bindings and their evaluations
export type Bindmap = {
  bindings: Binding[];
  evals: {[key: string]: any};
};

// A view, which contains an id, type, and config
export type View = {
  id: string;
  bindmap: Bindmap;
  // allow any other fields
  [key: string]: any;
};
