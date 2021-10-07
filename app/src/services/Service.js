import {CapacitorSQLite as sqlite} from "@capacitor-community/sqlite"

const database = "tathy"

class Service {
  constructor() {
    this.open()
  }

  async open() {
    try {
      await sqlite.createConnection({database})
      await sqlite.open({database})
    } catch (e) {
    }
  }

  async run(statement, values = []) {
    return await sqlite.run({
      database, statement, values
    })
  }

  async query(statement, values = []) {
    return await sqlite.query({
      database, statement, values
    })
  }

  async createAllTables() {
    await this.run("create table if not exists items(id CHAR(24) PRIMARY KEY, is_bookmarked INTEGER DEFAULT 0, is_liked INTEGER DEFAULT 0)")
    await this.run("create table if not exists packs(id CHAR(24) PRIMARY KEY, learned_count INTEGER DEFAULT 0)")
  }
}

export default Service
