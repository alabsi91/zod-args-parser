interface ListItem {
  name: string;
  tags: string[];
}

interface List {
  name: string;
  description?: string;
  items: ListItem[];
}

const defaultList: List = {
  name: "default",
  description: "Default list",
  items: [],
};

const exampleList: List = {
  name: "groceries",
  description: "List of groceries",
  items: [
    { name: "Egg", tags: ["food"] },
    { name: "Milk", tags: ["food"] },
    { name: "Bread", tags: ["food"] },
  ],
};

export const lists: Map<string, List> = new Map([
  ["default", defaultList],
  ["groceries", exampleList],
]);
