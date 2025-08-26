import { ItemRepository } from "../ports/ItemRepository";

export class DeleteItem {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(id: string): Promise<void> {
    await this.itemRepository.delete(id);
  }
}