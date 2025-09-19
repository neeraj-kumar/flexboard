// Common types for flexboard

// A binding is a user-defined variable
export type Binding = {
  name: string;
  def: string; // Definition or expression for the binding
};

// A bindmap contains a list of bindings and their evaluations
export type Bindmap = {
  bindings: {[key: string]: Binding};
  evals: {[key: string]: any[]}; // evaluated values for each binding
};

// A view, which contains an id, type, and config
export type View = {
  id: string;
  bindmap: Bindmap;
  inputs: string; // name of the input data to use
  // allow any other fields
  [key: string]: any;
};
