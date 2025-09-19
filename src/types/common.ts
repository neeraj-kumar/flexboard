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

// A view represents one way to look at our data
export type View = number;  // Currently just storing the view ID as a number
