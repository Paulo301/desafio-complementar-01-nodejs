import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title && !description) {
        return res.writeHead(400).end();
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title && !description) {
        return res.writeHead(400).end();
      }

      let data = {};

      if (title) {
        data.title = title;
      }

      if (description) {
        data.description = description;
      }

      data.updated_at = new Date();

      try {
        database.update("tasks", id, data);
      } catch (error) {
        return res.writeHead(404).end();
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        const task = database.selectById("tasks", id);

        if (!(task instanceof Error)) {
          database.update("tasks", id, {
            completed_at: !!task.completed_at ? null : new Date(),
          });
        } else {
          throw task;
        }
      } catch (error) {
        return res.writeHead(404).end();
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.delete("tasks", id);
      } catch (error) {
        return res.writeHead(404).end();
      }

      return res.writeHead(204).end();
    },
  },
];
