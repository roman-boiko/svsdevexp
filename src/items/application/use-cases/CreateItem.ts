import { ItemRepository } from "../ports/ItemRepository";
import { Item } from "../../domain/Item";

export class CreateItem {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(item: Item): Promise<void> {
    await this.itemRepository.save(item);
  }
}