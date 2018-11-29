# API

## Guidelines

### Response

- response should be json, even for errors.
- some particular routes could respond with redirects instead.
- response should be entity-prefixed.

### Routing

- opt for action-explicit role-prefixed RESTish routing, like follows
  - `GET|POST /role/module/action`
  - `GET|POST /role/module/feature/action`
  - `GET|POST /role/module/entity/action`
- CRUD operations:
  - `GET /role/module/entity` list entities
  - `POST /role/module/entity/create` create entity
  - `GET /role/module/entity/:id` get entity
  - `POST /role/module/entity/:id/edit` edit entity
  - `POST /role/module/entity/:id/delete` delete entity

Example:

- `GET /any/content/post`
- `POST /admin/content/post/create`
- `GET /any/content/post/:id`
- `POST /admin/content/post/:id/edit`
- `POST /admin/content/post/:id/delete`
