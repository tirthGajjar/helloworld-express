# API

[Preview](https://htmlpreview.github.io/?https://raw.githubusercontent.com/emiketic/emiketic-starter-express/master/docs/api/index.html)

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
  - `GET /role/module/entity/:uid` get entity
  - `POST /role/module/entity/:uid/edit` edit entity
  - `POST /role/module/entity/:uid/delete` delete entity

Example:

- `GET /any/content/post`
- `POST /admin/content/post/create`
- `GET /any/content/post/:uid`
- `POST /admin/content/post/:uid/edit`
- `POST /admin/content/post/:uid/delete`
