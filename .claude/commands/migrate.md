Migrate the AngularJS file at path: $ARGUMENTS

Follow all rules in CLAUDE.md. Use the migrate-component skill for full mapping tables.

## Steps

1. Read the file at `$ARGUMENTS` and identify the AngularJS construct:
   - `.controller(` → Angular `@Component`
   - `.service(` / `.factory(` → Angular `@Injectable`
   - `.directive(` → Angular `@Component` or `@Directive`
   - `.filter(` → Angular `@Pipe`

2. Determine the output file path using CLAUDE.md naming conventions:
   - controller/component → `<name>.component.ts` + `.html` + `.scss`
   - service/factory → `<name>.service.ts`
   - directive → `<name>.directive.ts` or `<name>.component.ts`
   - filter → `<name>.pipe.ts`

3. Apply these migration rules without exception:
   - Use `inject()` for all dependencies — never constructor injection
   - Use `standalone: true` — never NgModule
   - Use `ChangeDetectionStrategy.OnPush` on every component
   - Use Angular 17 `@if` / `@for` control flow — not `*ngIf` / `*ngFor`
   - Add `track <item.id>` on every `@for` loop
   - Replace `$scope` properties with class properties
   - Replace `$scope` methods with class methods
   - Replace `$http` with `inject(HttpClient)`
   - Replace `$q` with `Promise` or RxJS
   - Replace `$state.go()` with `inject(Router).navigate()`
   - Replace `$stateParams` with `inject(ActivatedRoute).snapshot.params`
   - Replace `$timeout` with `setTimeout` (clear in `ngOnDestroy`)
   - Map lifecycle: `$onInit`→`ngOnInit`, `$onDestroy`→`ngOnDestroy`, `$onChanges`→`ngOnChanges`, `$postLink`→`ngAfterViewInit`
   - Use `toSignal()` or `takeUntilDestroyed()` for all subscriptions

4. Create the output file(s) with proper TypeScript types — no `any` unless unavoidable.

5. If the file has an associated template (`.html`), migrate it too using the template mapping table in `migrate-component` skill.

6. Report when done:
   ```
   Migrated: <input file> → <output file(s)>
   Construct: <controller|service|directive|filter>
   Dependencies injected: <list>
   ⚠️ Manual follow-up: <list any $watch, $broadcast/$emit, $compile, or unmigrated deps>
   ```
