import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const updatedData = Object.fromEntries(Object.entries(this.#database[table][rowIndex]).map(([key, value]) => {
        if (!!Object.entries(data).map(([key, _]) => key).find(dataKey => dataKey.localeCompare(key) === 0)) {
          return [key, data[key]];
        }

        return [key, value];
      }))

      this.#database[table][rowIndex] = { id, ...updatedData };
      this.#persist();

      return this.#database[table][rowIndex];
    } else {
      return new Error("Not found");
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    } else {
      return new Error("Not found");
    }
  }

  selectById(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      return this.#database[table][rowIndex];
    } else {
      return new Error("Not found");
    }
  }
}
