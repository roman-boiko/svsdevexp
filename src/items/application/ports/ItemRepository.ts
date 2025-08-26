import { Item } from "../../domain/Item";

export interface ItemRepository {
  findById(id: string): Promise<Item | null>;
  list(): Promise<Item[]>;
  save(item: Item): Promise<void>;
  update(id: string, item: Item): Promise<void>;
  delete(id: string): Promise<void>;
}