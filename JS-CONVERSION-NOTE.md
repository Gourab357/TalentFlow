# JS/JSX Conversion Note

This folder is an automated conversion of the original TypeScript React assignment to plain JavaScript/JSX.
What changed:

- `.ts` → `.js`, `.tsx` → `.jsx`
- Removed `tsconfig.json` and most type-only code (`interface`, `type`, `enum` converted to objects, generics, `as` casts, etc.).
- Kept React and app structure intact. Some types-related utilities may have been stripped if they were purely for typing.

If any build errors appear, they will likely be from advanced TS-only patterns (complex generics, function overloads).
In those rare cases, update the affected lines to plain JS (e.g., remove leftover type hints or replace enums with objects).

Run:
```bash
npm install
npm run dev
```
(or your project's start command).