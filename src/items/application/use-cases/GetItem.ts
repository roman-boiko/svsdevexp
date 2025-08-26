import { ItemRepository } from "../ports/ItemRepository";
import { Item } from "../../domain/Item";

export class GetItem {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(id: string): Promise<Item | null> {
    return this.itemRepository.findById(id);
  }
}