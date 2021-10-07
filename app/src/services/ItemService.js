import Service from "src/services/Service";


class ItemService extends Service {

  async likeItem(id, is_liked) {
    await this.run(`INSERT INTO items (id, is_liked) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET is_liked = ?;`, [id, is_liked, is_liked])
  }

  async bookmarkItem(id, is_bookmarked) {
    await this.run(`INSERT INTO items (id, is_bookmarked) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET is_bookmarked = ?;`, [id, is_bookmarked, is_bookmarked])
  }

  async listBookmarkedItems() {
    return await this.query("select * from items where is_bookmarked = 1")
  }

  async listLikedItems() {
    return await this.query("select * from items where is_liked = 1")
  }
}

export default new ItemService()
