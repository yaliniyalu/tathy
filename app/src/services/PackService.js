import Service from "src/services/Service";

export class PackModel extends Service {
  constructor(pack) {
    super();

    if (pack) {
      this.pack = { id: pack._id, learned_count: 0 }
      this.initPackService(pack).then()
    }
  }

  async initPackService(p) {
    let pack = await this.getPack(p._id)
    if (!pack) {
      await this.insertPack(p)
    } else {
      this.pack = pack
    }
  }

  async getPack(id) {
    const { values } = await this.query("select * from packs where id = ?", [id])
    return values[0]
  }

  async insertPack(pack) {
    await this.run(`INSERT INTO packs (id) VALUES (?);`, [pack._id])
  }

  async update() {
    await this.run(`update packs set learned_count = ?`, [this.pack.learned_count])
  }

  async setLearningIndex(index) {
    if (this.pack.learned_count > (index + 1)) {
      return
    }

    this.pack.learned_count = index + 1
    await this.update()
  }
}

class PackService extends Service {
  async getMultiple(ids) {
    const { values } = await this.query(`select * from packs where id in (${ids.map(_ => '?').join(',')})`, [...ids])
    return values
  }

  async getPack(id) {
    const { values } = await this.query("select * from packs where id = ?", [id])
    return values[0]
  }
}

export default new PackService()

