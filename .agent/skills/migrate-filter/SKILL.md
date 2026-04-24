---
name: Migrate AngularJS Filter to Angular 17 Pipe
description: Migrates an AngularJS .filter() to an Angular 17 standalone @Pipe with proper TypeScript types. Handles pure, impure, and array-filter patterns.
---

# Migrate AngularJS Filter to Angular 17 Pipe

Migrate the AngularJS filter at: `$ARGUMENTS`

---

## Step 1 — Read and Classify

Read the filter file and identify:
- Filter name (used in templates as `| filterName`)
- Transform function signature: `(input, arg1, arg2) => output`
- Input type (string, array, number, object)
- Output type
- Whether the filter has side effects or depends on external state (→ impure pipe)
- Whether the filter is used as `| filter: searchTerm` array filtering

---

## Step 2 — Plan

```
Filter name:  <name>
Usage:        {{ value | <name>:arg1:arg2 }}
Input type:   <string | number | Date | T[] | object>
Output type:  <string | number | T[]>
Pure:         yes | no  (impure if depends on external state or has side effects)
```

---

## Step 3 — Create the Pipe

Create `<name>.pipe.ts`:

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: '<camelCaseName>',
  standalone: true,
  pure: true,  // set to false only if the transform depends on mutable external state
})
export class <Name>Pipe implements PipeTransform {
  transform(value: <InputType>, arg1?: <ArgType>): <OutputType> {
    // migrated logic here
  }
}
```

### Mapping Rules

| AngularJS filter | Angular pipe |
|-----------------|--------------|
| `angular.module('app').filter('name', fn)` | `@Pipe({ name: 'name', standalone: true })` |
| `function(input, arg) { return x; }` | `transform(value: T, arg?: A): R { return x; }` |
| `$filter('name')(value, arg)` | `inject(NamePipe).transform(value, arg)` in TS code |
| Pure transform (no side effects) | `pure: true` (default) |
| Depends on service / changes externally | `pure: false` + `inject()` service |

### Built-in Filter Replacements
Do NOT create a custom pipe if a built-in Angular pipe exists:

| AngularJS | Angular built-in |
|-----------|-----------------|
| `| currency` | `CurrencyPipe` / `{{ val \| currency }}` |
| `| date:'short'` | `DatePipe` / `{{ val \| date:'short' }}` |
| `| number:'1.2-2'` | `DecimalPipe` |
| `| uppercase` / `| lowercase` | `UpperCasePipe` / `LowerCasePipe` |
| `| json` | `JsonPipe` |
| `| slice:0:5` | `SlicePipe` |
| `| async` | `AsyncPipe` |

### Array Filter Pattern (`| filter: searchTerm`)
AngularJS `| filter` has no direct Angular equivalent. Migrate to a component-level computed signal:

```ts
// AngularJS template
// <li ng-repeat="item in items | filter: searchText">

// Angular 17 — in the component class
readonly searchText = signal('');
readonly filteredItems = computed(() =>
  this.items().filter(item =>
    item.name.toLowerCase().includes(this.searchText().toLowerCase())
  )
);
```

```html
<!-- Angular 17 template -->
<input [(ngModel)]="searchText" />
@for (item of filteredItems(); track item.id) {
  <li>{{ item.name }}</li>
}
```

Only create a custom `FilterPipe` if the filter is reused across multiple components.

### Injecting Dependencies in Pipes
If the pipe needs a service (making it impure):
```ts
@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string): string {
    return this.i18n.get(key);
  }
}
```

---

## Step 4 — Add to Component Imports

The pipe must be added to the `imports` array of every standalone component that uses it:

```ts
@Component({
  standalone: true,
  imports: [NamePipe],
  ...
})
```

---

## Step 5 — Update Templates

Replace AngularJS filter syntax with Angular pipe syntax — syntax is identical for simple cases:
```html
<!-- AngularJS -->
{{ price | currency:'USD' }}

<!-- Angular (unchanged) -->
{{ price | currency:'USD' }}
```

For filters used in `ng-repeat` expressions, move logic to component as described above.

---

## Step 6 — Summary

```
## Migration Complete

File created: src/app/<path>/<name>.pipe.ts

Filter name:   <name>
Input → Output: <T> → <R>
Pure: yes | no
Built-in replacement used: yes (<PipeName>) | no

⚠️  Manual follow-up:
  - Components that need this pipe added to their imports[]: <list>
  - Array filter usages moved to computed() in component: <list files + line numbers>
  - $filter('name') calls in TypeScript to update: <list>
```
