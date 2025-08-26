import { ItemRepository } from "../ports/ItemRepository";
import { Item } from "../../domain/Item";

export class ListItems {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(): Promise<Item[]> {
    return this.itemRepository.list();
  }
}