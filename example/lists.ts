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

export const lists: Map<string, List> = new Map([["default", defaultList]]);
