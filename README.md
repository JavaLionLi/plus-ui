# plus-ui-react

React + Ant Design rewrite of `plus-ui-new`.

The first milestone keeps the existing RuoYi-Vue-Plus backend protocol:

- `/auth/login`
- `/auth/code`
- `/system/user/getInfo`
- `/system/menu/getRouters`
- `Authorization: Bearer <token>`
- `clientid`
- optional encrypted request and response bodies

## Scripts

```bash
pnpm install
pnpm dev
```

The development proxy forwards `/dev-api` to `http://localhost:8080`.
