import { ItemRepository } from "../ports/ItemRepository";
import { Item } from "../../domain/Item";

export class UpdateItem {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(id: string, item: Item): Promise<void> {
    await this.itemRepository.update(id, item);
  }
}